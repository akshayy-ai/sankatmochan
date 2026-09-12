import { NextRequest, NextResponse } from "next/server";
import { analyzeEmergency, appendTurn, getCase, reviseCase, raiseSeverity } from "@/lib/caseStore";
import {
  applyKeywordFloor,
  endCall,
  getCall,
  markAsked,
  nextSlot,
  openCall,
  questionFor,
  recordSilence,
  recordSpeech,
  resumeCall,
  type CallSession,
} from "@/lib/callSession";

/**
 * Vobiz speech Gather callback — one turn of a 112 call.
 *
 * Two invariants, both learned from the version this replaces:
 *
 *  1. Every document returned contains a <Gather>. A response without one ends
 *     the call, which is how a caller the system could not understand was told
 *     to "please call again" and then disconnected, with no case filed.
 *
 *  2. No model call is ever on the caller's clock. The next question comes from
 *     a deterministic ladder; triage runs detached and enriches the case after
 *     the XML is already on the wire. Model latency on a live line is dead air,
 *     and the model is least available exactly when call volume is highest.
 */

const GATHER_LANGUAGE = process.env.VOBIZ_GATHER_LANGUAGE || "hi-IN";
/** After this many silent laps with a located case, release the line. */
const HOLD_LAPS = 10;

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xml(body: string) {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

async function readParams(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) return await req.json();
    const form = await req.formData();
    return Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, String(v)])
    );
  } catch {
    return Object.fromEntries(req.nextUrl.searchParams.entries());
  }
}

function baseUrl(req: NextRequest) {
  const explicit = process.env.PUBLIC_BASE_URL;
  const fwdHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const fwdProto = req.headers.get("x-forwarded-proto") || "https";
  const base =
    explicit ||
    (fwdHost && !fwdHost.startsWith("0.0.0.0") && !fwdHost.startsWith("127.")
      ? `${fwdProto}://${fwdHost}`
      : `${req.nextUrl.protocol}//${req.nextUrl.host}`);
  return base.replace(/\/$/, "");
}

/** Spoken digit by digit so a case number survives a noisy line. */
function spokenCaseId(caseId: string) {
  return caseId.replace(/^[A-Z]+-/, "").split("").join(" ");
}

/** Build a turn: say something, then keep listening. Never ends the call. */
function turnXml(
  req: NextRequest,
  s: CallSession,
  say: string,
  opts: { timeout?: number; prompt?: string } = {}
) {
  const b = baseUrl(req);
  const q = `case=${encodeURIComponent(s.caseId)}&uuid=${encodeURIComponent(s.uuid)}`;
  const timeout = opts.timeout ?? 7;
  return `<Response>
  <Speak language="${GATHER_LANGUAGE}">${escapeXml(say)}</Speak>
  <Gather inputType="speech dtmf"
          language="${GATHER_LANGUAGE}"
          timeout="${timeout}"
          speechEndTimeout="auto"
          speechModel="phone_call"
          numDigits="1"
          action="${b}/api/vobiz/gather?${q}"
          method="POST">${
            opts.prompt
              ? `\n    <Speak language="${GATHER_LANGUAGE}">${escapeXml(opts.prompt)}</Speak>`
              : ""
          }
  </Gather>
  <Redirect>${b}/api/vobiz/gather?${q}&amp;silent=1</Redirect>
</Response>`;
}

/**
 * The silence ladder.
 *
 * A caller in crisis goes quiet for reasons that make the call more urgent,
 * not less — trapped, injured, or hiding from someone. Silence never ends the
 * call while they might still be there.
 */
function onSilence(req: NextRequest, s: CallSession): string {
  recordSilence(s);
  const c = getCase(s.caseId);
  const lap = s.consecutiveSilent;

  if (lap === 1) {
    // Repeat verbatim. A distracted caller heard half of it; rephrasing
    // restarts comprehension from zero.
    return turnXml(
      req,
      s,
      s.lastQuestion || "कृपया बताइए, क्या हुआ है?",
      { timeout: 10 }
    );
  }

  if (lap === 2) {
    // The DTMF door. Deliberately short and unexplained — this plays on the
    // handset speaker, possibly audible to whoever the caller is hiding from.
    return turnXml(
      req,
      s,
      "अगर आप बोल नहीं सकते, तो एक दबाइए।",
      { timeout: 10 }
    );
  }

  // Bounded hold. Releasing only once the case is filed and located, because
  // holding every silent line forever exhausts channel capacity — during a
  // flood that produces a busy signal at the carrier, with no case and no log.
  const located = !!c && c.location !== "Location not shared";
  if (lap >= HOLD_LAPS && located) {
    endCall(s.uuid, "held_out");
    return `<Response>
  <Speak language="${GATHER_LANGUAGE}">${escapeXml(
    `आपकी सूचना दर्ज है। आपका केस नंबर है ${spokenCaseId(s.caseId)}। कुछ बदले तो दोबारा कॉल कीजिए।`
  )}</Speak>
  <Hangup/>
</Response>`;
  }

  // Never spoke at all — answered, silent throughout. Release after the full
  // ladder, keeping the case so an operator sees that this number rang.
  if (!s.everSpoke && lap >= HOLD_LAPS) {
    reviseCase(s.caseId, {
      severity: "LOW",
      englishTranslation: "Call answered but caller never spoke.",
    });
    endCall(s.uuid, "silent_call");
    return `<Response>
  <Speak language="${GATHER_LANGUAGE}">हमें कोई आवाज़ नहीं मिली। ज़रूरत हो तो दोबारा कॉल कीजिए।</Speak>
  <Hangup/>
</Response>`;
  }

  // Reassure every third lap, otherwise just keep the line open quietly.
  const reassure = lap % 3 === 0;
  return turnXml(
    req,
    s,
    reassure ? "मैं लाइन पर हूँ। जब बोल सकें, बताइए।" : "",
    { timeout: 30 }
  );
}

export async function POST(req: NextRequest) {
  let s: CallSession | undefined;
  try {
    const p = await readParams(req);
    const q = req.nextUrl.searchParams;

    const uuid = (p.CallUUID || q.get("uuid") || "").trim();
    s =
      getCall(uuid) ||
      resumeCall(q.get("case"), uuid, p.From || "Unknown") ||
      openCall(uuid || `recovered-${Date.now()}`, p.From || "Unknown");

    // `s` is declared with let so the catch block can reference it; narrow it
    // to a const here so closures below do not see it as possibly undefined.
    const sess: CallSession = s;

    sess.lastSeenAt = Date.now();
    const speech = (p.Speech || "").trim();
    const digit = (p.Digits || "").trim();
    const confidence = parseFloat(p.SpeechConfidenceScore || "0");

    // Silence is evaluated before any caching, so each lap advances the ladder
    // rather than replaying the previous lap's document forever.
    if (!speech && !digit) {
      return xml(onSilence(req, s));
    }

    // "I cannot speak." Treat as its own emergency signal, stop asking open
    // questions, and floor severity — this is the hostage and DV path.
    if (digit === "1" && !speech) {
      sess.everSpoke = true;
      sess.consecutiveSilent = 0;
      appendTurn(sess.caseId, { kind: "DTMF", text: "Caller pressed 1 — cannot speak" });
      raiseSeverity(sess.caseId, "CRITICAL");
      const c = getCase(sess.caseId);
      if (c) {
        c.slots = { ...(c.slots || {}), safe_to_speak: "caller cannot speak" };
        c.attention = [...(c.attention || []), "CANNOT_SPEAK"];
      }
      return xml(
        turnXml(
          req,
          s,
          "समझ गया। मदद के लिए सूचना दर्ज कर दी गई है। लाइन पर रहिए।",
          { timeout: 30 }
        )
      );
    }

    recordSpeech(s, speech, confidence);

    // Deterministic floor first — it works with no model at all.
    const floor = applyKeywordFloor(sess.caseId, speech);
    const c = getCase(sess.caseId);
    const category = floor.category || c?.category || "GENERAL";

    // Credit the slot we last asked about.
    const pending = (Object.keys(sess.asked) as (keyof typeof sess.asked)[]).find(
      (k) => !sess.answered.includes(k as never)
    );
    if (pending && c) {
      sess.answered.push(pending as never);
      c.slots = { ...(c.slots || {}), [pending]: speech };
      if (pending === "where") reviseCase(sess.caseId, { location: speech });
    }

    // First substantive turn becomes the case's headline.
    if (sess.turns === 1) {
      reviseCase(sess.caseId, { message: speech, category });
    }

    // Triage runs detached — the caller is not waiting on it.
    void analyzeEmergency(speech, { spokenReply: true })
      .then((a) => {
        reviseCase(sess.caseId, {
          language: a.language,
          englishTranslation: a.translation,
          category: a.category,
        });
        raiseSeverity(sess.caseId, a.severity);
        console.log(
          `[vobiz] ${sess.caseId} turn=${sess.turns} ${a.severity}/${a.category} lang=${a.language} conf=${confidence.toFixed(2)}`
        );
      })
      .catch((err) => console.error("[vobiz] triage failed:", err));

    // Ask the next thing we actually need.
    const slot = nextSlot(s, category);
    if (slot) {
      markAsked(s, slot);
      return xml(turnXml(req, sess, "समझ गया।", { prompt: questionFor(slot) }));
    }

    // Everything needed is gathered. Confirm and keep listening — the caller
    // may still have more to say, and the line is theirs to end.
    //
    // No unit is named and no ETA is given: this system dispatches nothing.
    // Telling someone in a burning building that engines are coming can stop
    // them self-rescuing, or calling someone who could actually help.
    return xml(
      turnXml(
        req,
        s,
        `आपकी सूचना कंट्रोल रूम में दर्ज हो गई है। आपका केस नंबर है ${spokenCaseId(
          sess.caseId
        )}। दोहराता हूँ, ${spokenCaseId(
          sess.caseId
        )}। कुछ और बताना हो तो बताइए, मैं सुन रहा हूँ।`,
        { timeout: 20 }
      )
    );
  } catch (err) {
    console.error("[vobiz] gather error:", err);
    // Even a crash keeps the line open. Returning a non-200 or a document
    // without a Gather would drop a caller mid-emergency.
    const b = baseUrl(req);
    const q = s ? `case=${encodeURIComponent(s.caseId)}&uuid=${encodeURIComponent(s.uuid)}` : "";
    return xml(`<Response>
  <Speak language="${GATHER_LANGUAGE}">मैं लाइन पर हूँ। कृपया बताइए।</Speak>
  <Gather inputType="speech dtmf" language="${GATHER_LANGUAGE}" timeout="20"
          speechEndTimeout="auto" action="${b}/api/vobiz/gather?${q}" method="POST"/>
  <Redirect>${b}/api/vobiz/gather?${q}&amp;silent=1</Redirect>
</Response>`);
  }
}

/** Caller hung up. Configure as the number's Hangup URL. */
export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get("uuid");
  if (uuid) endCall(uuid, "caller_hangup");
  return NextResponse.json({ ok: true });
}
