import { NextRequest, NextResponse } from "next/server";
import { addCase, analyzeEmergency, nextCaseId } from "@/lib/caseStore";

/**
 * Vobiz speech Gather callback.
 *
 * Receives the caller's transcribed speech, triages it with the same model the
 * Telegram channel uses, files the case into the shared store so it surfaces on
 * the operator console, and replies with Voice XML spoken back in the caller's
 * own language.
 *
 * Vobiz sends: Speech, InputType, SpeechConfidenceScore, CallUUID, From, To
 */

/** XML text nodes must not carry raw &, <, > or quotes. */
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

/** Read Vobiz params whether they arrive as form-encoded or JSON. */
async function readParams(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      return await req.json();
    }
    const form = await req.formData();
    return Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, String(v)])
    );
  } catch {
    return Object.fromEntries(req.nextUrl.searchParams.entries());
  }
}

/** Speak a case number digit by digit so it survives a noisy phone line. */
function spokenCaseId(caseId: string) {
  return caseId.replace(/[A-Z]+-/, "").split("").join(" ");
}

export async function POST(req: NextRequest) {
  const params = await readParams(req);

  const speech = (params.Speech || "").trim();
  const callUuid = params.CallUUID || "";
  const from = params.From || "Unknown";
  const confidence = parseFloat(params.SpeechConfidenceScore || "0");

  // Nothing recognised — invite one retry rather than dropping the caller.
  if (!speech) {
    return xml(`<Response>
  <Speak language="hi-IN">माफ़ कीजिए, हम आपकी बात समझ नहीं पाए। कृपया दोबारा कॉल करके अपनी आपात स्थिति बताइए।</Speak>
</Response>`);
  }

  const analysis = await analyzeEmergency(speech, { spokenReply: true });
  const caseId = nextCaseId("CALL");

  addCase({
    id: caseId,
    chatId: 0,
    senderName: from,
    message: speech,
    language: analysis.language,
    englishTranslation: analysis.translation,
    severity: analysis.is_emergency ? analysis.severity : "LOW",
    category: analysis.is_emergency ? analysis.category : "GENERAL",
    timestamp: new Date().toISOString(),
    location: analysis.location || "Location not shared",
    channel: "CALL",
    audioTranscript: speech,
    callUuid,
    callerNumber: from,
  });

  console.log(
    `[vobiz] ${caseId} ${analysis.severity}/${analysis.category} ` +
      `lang=${analysis.language} conf=${confidence.toFixed(2)} from=${from}`
  );

  const reply =
    analysis.response ||
    "आपकी सूचना दर्ज कर ली गई है। मदद भेजी जा रही है।";

  return xml(`<Response>
  <Speak>${escapeXml(reply)}</Speak>
  <Speak language="hi-IN">आपका केस नंबर है ${spokenCaseId(caseId)}।</Speak>
</Response>`);
}
