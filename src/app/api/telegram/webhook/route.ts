import { NextRequest, NextResponse } from "next/server";
import {
  addCase,
  addAttention,
  appendTurn,
  listCases,
  nextCaseId,
  analyzeEmergency,
  openIncidentFor,
  raiseSeverity,
  reviseCase,
  setLastLocation,
  getLastLocation,
  backfillLocation,
  touchCase,
  type LiveCase,
} from "@/lib/caseStore";
import { clusterCases } from "@/lib/clustering";

/**
 * Telegram Bot Webhook — receives text, voice, AND image emergency messages
 * in any language.
 *
 * Channels:
 * - Text → GPT-4o-mini classifies
 * - Voice note → Whisper transcribes → GPT-4o-mini classifies
 * - Photo → GPT-4o vision analyzes scene → classifies emergency
 *
 * POST /api/telegram/webhook
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

type TelegramCase = LiveCase;

// GET — dashboard can poll for new Telegram cases
export async function GET() {
  const cases = listCases();

  // Group reports of the same incident. Cases are returned untouched — the
  // cluster is a view over them, never a rewrite, so a wrong grouping can
  // never hide somebody's emergency.
  const clusters = clusterCases(cases);
  const byCase = new Map<string, { id: string; size: number; major: boolean }>();
  for (const cl of clusters) {
    for (const id of cl.caseIds) {
      byCase.set(id, { id: cl.id, size: cl.caseIds.length, major: cl.major });
    }
  }

  return NextResponse.json({
    cases: cases.map((c) => ({ ...c, cluster: byCase.get(c.id) })),
    count: cases.length,
    clusters,
  });
}

// POST — Telegram sends updates here
export async function POST(req: NextRequest) {
  let message: TelegramMessage | undefined;
  try {
    message = (await req.json())?.message;
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!message) {
    return NextResponse.json({ ok: true });
  }

  // Acknowledge before doing the work. Voice and photo handling takes tens of
  // seconds (file download plus Whisper or vision), long enough that the edge
  // gives up on the origin and hands Telegram a 502 — which Telegram then
  // retries with an exponential backoff that stalls every later message too.
  void processMessage(message).catch((err) =>
    console.error("Telegram processing error:", err)
  );

  return NextResponse.json({ ok: true });
}

type TelegramMessage = {
  chat: { id: number };
  from?: { first_name?: string; last_name?: string };
  text?: string;
  caption?: string;
  location?: { latitude: number; longitude: number };
  photo?: { file_id: string }[];
  voice?: { file_id: string };
  audio?: { file_id: string };
  // Media the old handler ignored entirely. A ten-second video of a burning
  // building used to get complete silence, because the handler returned early
  // on anything without `text`.
  video?: { file_id: string };
  video_note?: { file_id: string };
  document?: { file_id: string; file_name?: string; mime_type?: string };
  sticker?: { file_id: string };
  contact?: { phone_number?: string };
};

type MsgKind = "TEXT" | "VOICE" | "PHOTO" | "LOCATION" | "OTHER";

function classifyKind(m: TelegramMessage): MsgKind {
  if (m.location) return "LOCATION";
  if (m.photo?.length) return "PHOTO";
  if (m.voice || m.audio) return "VOICE";
  if (m.text) return "TEXT";
  return "OTHER";
}

/**
 * The caller's own words, never a placeholder.
 *
 * A photo caption is where "second floor, my mother is inside" usually lives;
 * recording the turn as "[photo]" throws that away.
 */
function rawTextOf(m: TelegramMessage): string {
  if (m.text) return m.text;
  if (m.caption) return m.caption;
  if (m.location) return `[location pin] ${m.location.latitude.toFixed(5)},${m.location.longitude.toFixed(5)}`;
  if (m.photo?.length) return "[photo, no caption]";
  if (m.voice || m.audio) return "[voice note]";
  if (m.video_note) return "[video note]";
  if (m.video) return "[video]";
  if (m.document) return `[file: ${m.document.file_name || m.document.mime_type || "document"}]`;
  if (m.sticker) return "[sticker]";
  if (m.contact) return `[contact: ${m.contact.phone_number || "shared"}]`;
  return "[unsupported message]";
}

function mediaIdOf(m: TelegramMessage): string | undefined {
  return (
    m.voice?.file_id || m.audio?.file_id ||
    m.photo?.[m.photo.length - 1]?.file_id ||
    m.video?.file_id || m.video_note?.file_id ||
    m.document?.file_id || m.sticker?.file_id
  );
}

/**
 * Runs after the webhook has already been acknowledged.
 *
 * Ordering is the whole design: the turn is WRITTEN before any download,
 * model call or reply. Every failure after that point leaves the caller's
 * words on a case an operator can see. The previous version did the slow work
 * first, so a failed transcription or an OpenAI outage meant the message
 * existed nowhere at all.
 */
async function processMessage(message: TelegramMessage) {
  const chatId = message.chat.id;
  const senderName =
    [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") ||
    "Unknown";

  try {
    // Commands are the only messages that never become turns.
    if (message.text === "/start" || message.text === "/help") {
      await sendTelegram(chatId, message.text === "/start" ? START_TEXT : HELP_TEXT);
      return;
    }

    const kind = classifyKind(message);
    const raw = rawTextOf(message);
    const open = openIncidentFor(chatId);

    // ── Location pins attach to the open incident, never open a new case ──
    if (kind === "LOCATION" && message.location) {
      const { latitude, longitude } = message.location;
      setLastLocation(chatId, latitude, longitude);
      const coords = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
      const updated = backfillLocation(chatId, coords);
      if (updated) {
        appendTurn(updated, { kind: "LOCATION", text: raw });
        touchCase(updated);
      }
      await sendTelegram(chatId,
        `📍 Location received: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n\n` +
        (updated
          ? `Pinned to case *${updated}* — responders can see exactly where you are.`
          : "Now describe your emergency — type, voice note 🎤, or photo 📸")
      );
      return;
    }

    // ── STEP 1: WRITE. Nothing slow happens before this. ──────────────────
    let caseId: string;
    let isNew = false;

    if (open) {
      caseId = open.id;
      appendTurn(caseId, { kind: kind === "OTHER" ? "SYSTEM" : kind, text: raw });
      touchCase(caseId);
    } else {
      isNew = true;
      caseId = nextCaseId("TG");
      addCase({
        id: caseId,
        chatId,
        senderName,
        message: raw,
        language: "Unknown",
        englishTranslation: "",
        // Provisional until enrichment lands. Never NONE — an unanalysed
        // report must still be visible to an operator.
        severity: "MEDIUM",
        category: "GENERAL",
        timestamp: new Date().toISOString(),
        location: getLastLocation(chatId) || "Location not shared",
        channel: kind === "OTHER" ? "TEXT" : (kind as LiveCase["channel"]),
        turns: [],
        slots: {},
        attention: [],
      });
      appendTurn(caseId, { kind: kind === "OTHER" ? "SYSTEM" : kind, text: raw });
    }

    // ── STEP 2: RECEIPT, before the slow work ─────────────────────────────
    if (kind === "VOICE") await sendTelegram(chatId, "🎤 _Transcribing your voice message..._");
    else if (kind === "PHOTO") await sendTelegram(chatId, "📸 _Analyzing the image..._");

    // ── STEP 3: ENRICH IN PLACE. Failures leave the turn written. ─────────
    let enriched = raw;

    if (kind === "VOICE") {
      const fileId = message.voice?.file_id || message.audio?.file_id;
      const transcript = fileId ? await transcribeVoice(fileId) : null;
      if (transcript) {
        enriched = transcript;
        reviseCase(caseId, { audioTranscript: transcript, message: transcript });
        appendTurn(caseId, { kind: "SYSTEM", text: `Transcript: ${transcript}` });
      } else {
        // The audio still exists on Telegram's servers; the file_id makes it
        // recoverable, so an operator can listen even though ASR failed.
        addAttention(caseId, "NEEDS_REVIEW");
        appendTurn(caseId, {
          kind: "SYSTEM",
          text: `Transcription failed — audio file_id ${mediaIdOf(message) || "unknown"}`,
        });
        await sendTelegram(chatId,
          `✅ Your voice message is filed as *${caseId}*.\n\n` +
          "We could not transcribe it — an operator will listen to it.\n" +
          "If you can, please also type what is happening."
        );
        return;
      }
    }

    if (kind === "PHOTO") {
      const fileId = message.photo?.[message.photo.length - 1]?.file_id;
      const analysis = fileId ? await analyzeImage(fileId, message.caption) : null;
      if (analysis) {
        enriched = message.caption
          ? `${message.caption} — ${analysis.description}`
          : analysis.description;
        reviseCase(caseId, {
          imageAnalysis: analysis.description,
          englishTranslation: analysis.description,
          category: analysis.category,
        });
        raiseSeverity(caseId, analysis.severity);
        appendTurn(caseId, { kind: "SYSTEM", text: `Vision: ${analysis.description}` });
      } else {
        addAttention(caseId, "NEEDS_REVIEW");
        appendTurn(caseId, { kind: "SYSTEM", text: "Image analysis unavailable" });
        await sendTelegram(chatId,
          `✅ Your photo is filed as *${caseId}*.\n\n` +
          "Automatic analysis was unavailable — an operator will look at it.\n" +
          "If you can, please describe what is happening."
        );
        return;
      }
    }

    if (kind === "OTHER") {
      // Video, video note, document, sticker — previously answered with total
      // silence. It is filed and acknowledged; an operator opens the media.
      addAttention(caseId, "NEEDS_REVIEW");
      await sendTelegram(chatId,
        `✅ Received and filed as *${caseId}*.\n\n` +
        "We cannot read this attachment automatically, so an operator will review it.\n" +
        "Please also describe your emergency in words, a voice note 🎤, or a photo 📸."
      );
      return;
    }

    // Follow-up turns are triaged WITH the incident so far. This is the whole
    // point of keeping conversation state: a fragment answering a question is
    // meaningless alone and unambiguous in context.
    const prior = open
      ? (open.turns || [])
          .filter((t) => t.kind !== "SYSTEM")
          .slice(0, -1)
          .map((t) => `- ${t.text}`)
          .join("\n")
      : "";
    const analysis = await analyzeEmergency(enriched, prior ? { context: prior } : {});

    reviseCase(caseId, {
      language: analysis.language,
      englishTranslation: analysis.translation,
      category: analysis.category,
      location: analysis.location,
    });
    raiseSeverity(caseId, analysis.severity);

    // ── First contact is never dropped ────────────────────────────────────
    // "मदद", "can you call me back later", a photo the model reads as a
    // selfie — the messages a classifier is most likely to dismiss are the
    // ones a frightened or coerced caller sends. Filing a LOW case costs an
    // operator one glance and one click.
    if (!analysis.is_emergency) {
      if (isNew) {
        reviseCase(caseId, { severity: "LOW" });
        addAttention(caseId, "NEEDS_REVIEW");
      }
      await sendTelegram(chatId,
        (analysis.response || HELPLINE_BLURB) + `\n\n_Ref: ${caseId}_`
      );
      return;
    }

    // The caller saying they are fine is advisory. The case stays OPEN and
    // visible; only an operator resolves it.
    if (/^\/(close|done)$/i.test(message.text || "")) {
      reviseCase(caseId, { callerSaysResolved: true });
      appendTurn(caseId, { kind: "SYSTEM", text: "Caller indicated the situation is resolved" });
      await sendTelegram(chatId,
        `Noted. *${caseId}* stays with an operator until they confirm it.\n\n` +
        "If anything changes, just message again."
      );
      return;
    }

    const c = listCases().find((x) => x.id === caseId);
    const sevEmoji =
      c?.severity === "CRITICAL" ? "🔴" :
      c?.severity === "HIGH" ? "🟠" :
      c?.severity === "MEDIUM" ? "🔵" : "⚪";

    if (isNew) {
      await sendTelegram(chatId,
        `${sevEmoji} *Case ${caseId} created*\n\n` +
        `📋 ${c?.category} · ⚠️ ${c?.severity} · 🗣️ ${c?.language}\n\n` +
        `🔄 _${analysis.translation}_\n\n` +
        (analysis.response || "Your report has been registered.") +
        `\n\n📍 Share your location so responders can find you.`
      );
    } else {
      // Follow-ups get one short line, not the whole card again. Re-sending a
      // formatted case block every twenty seconds to someone watching a fire
      // is noise.
      await sendTelegram(chatId,
        `${sevEmoji} Added to *${caseId}*. ${
          c?.location === "Location not shared"
            ? "If you can, share your location 📍"
            : "An operator can see this."
        }`
      );
    }
  } catch (err) {
    console.error("Telegram webhook error:", err);
    // Even here the caller hears something — silence reads as "nobody got it".
    await sendTelegram(chatId,
      "✅ Your message was received. Something went wrong on our side while " +
      "processing it, and an operator has been alerted."
    ).catch(() => {});
  }
}

const START_TEXT =
  "🚨 *Sankatmochan · संकटमोचन*\n_India 112 Emergency Response_\n\n" +
  "Report emergencies in *any language*:\n\n" +
  "📝 Type your emergency\n" +
  "🎤 Send a voice note\n" +
  "📸 Send a photo of the situation\n" +
  "📍 Share your location\n\n" +
  "आपातकालीन संदेश हिंदी में भेजें\n" +
  "మీ అత్యవసర సందేశాన్ని తెలుగులో పంపండి\n" +
  "तुमचा आणीबाणीचा संदेश मराठीत पाठवा\n\n" +
  "🌍 Visiting India? Write in your own language — Español, Français, " +
  "日本語, Deutsch, العربية all work. Nothing to select.\n\n" +
  "📞 For immediate help, call 112.";

const HELP_TEXT =
  "📋 *How to report an emergency:*\n\n" +
  "1. 📝 Type, 🎤 voice note, or 📸 photo\n" +
  "2. 📍 Share your location (📎 → Location)\n" +
  "3. Keep messaging — follow-up details are added to the same case\n\n" +
  "Your case number appears on every reply.\n\n" +
  "📞 For immediate help, call 112.";

const HELPLINE_BLURB =
  "🙏 This is the *Sankatmochan 112 Emergency Helpline*.\n\n" +
  "If you are in danger, describe what is happening — type, voice note 🎤, or photo 📸.\n\n" +
  "📞 For immediate help, call *112*";

// ═══════════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════════

/** Download a file from Telegram by file_id → returns base64 data URL */
async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  if (!TELEGRAM_TOKEN) return null;
  try {
    const fileRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`
    );
    const fileData = await fileRes.json();
    if (!fileData.ok || !fileData.result?.file_path) return null;
    return `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileData.result.file_path}`;
  } catch {
    return null;
  }
}

/**
 * Returned when vision analysis cannot produce a verdict. Deliberately marked
 * as an emergency: a failed analyser must not decide that a citizen's photo
 * was uninteresting.
 */
const NEEDS_REVIEW = {
  description: "Image received but automatic analysis was unavailable — needs operator review.",
  is_emergency: true,
  severity: "MEDIUM",
  category: "GENERAL",
  location: "",
  peopleCount: "Unknown",
  injuries: "",
  hazards: "",
  language: "Visual",
  response: "Your photo has been received and flagged for an operator to review.",
};

/** Analyze an image using GPT-4o vision */
async function analyzeImage(
  fileId: string,
  caption?: string
): Promise<{
  description: string;
  is_emergency: boolean;
  severity: string;
  category: string;
  location: string;
  peopleCount: string;
  injuries: string;
  hazards: string;
  language: string;
  response: string;
} | null> {
  if (!OPENAI_KEY) return null;

  try {
    const imageUrl = await getTelegramFileUrl(fileId);
    if (!imageUrl) return null;

    // Download image and convert to base64
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(imgBuffer).toString("base64");

    // Telegram's file server answers with application/octet-stream, which
    // OpenAI rejects ("Invalid MIME type. Only image types are supported"),
    // so trusting the response header meant the model never saw the photo.
    // Take the type from the file extension and fall back to JPEG, which is
    // what Telegram stores compressed photos as.
    const headerType = imgRes.headers.get("content-type") || "";
    const extType =
      /\.png(\?|$)/i.test(imageUrl) ? "image/png" :
      /\.webp(\?|$)/i.test(imageUrl) ? "image/webp" :
      /\.gif(\?|$)/i.test(imageUrl) ? "image/gif" :
      "image/jpeg";
    const mimeType = headerType.startsWith("image/") ? headerType : extType;

    const dataUrl = `data:${mimeType};base64,${base64}`;

    const messages: any[] = [
      {
        role: "system",
        content: `You are an emergency scene analyst for India's 112 helpline.

Someone deliberately sent this photograph TO AN EMERGENCY NUMBER. Assume they
had a reason. Your question is not "is a disaster happening in this frame right
now" — it is "would a responder want to see this?"

Answer with JSON:
{
  "is_emergency": true or false — see the rule below,
  "description": "What you see — describe the situation concretely",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "category": "FLOOD | MEDICAL | FIRE | SAFETY | MISSING | ACCIDENT | DV | GENERAL",
  "location": "any identifiable location clues (signs, landmarks, plates)",
  "peopleCount": "estimated number of people visible or 'None visible'",
  "injuries": "visible injuries, or empty string",
  "hazards": "immediate hazards visible, or empty string",
  "language": "language of any signage, otherwise 'Visual'",
  "response": "Brief reply to the sender acknowledging what was reported"
}

is_emergency is TRUE for anything a responder would act on, INCLUDING the
aftermath of an incident that has already happened:
- Crashed, overturned or damaged vehicles — even with nobody visibly hurt and
  no active danger. A wrecked motorcycle or car IS a reportable accident.
- Debris, wreckage, collapsed or damaged structures
- Fire, smoke, scorching; flooding or standing water
- Injured, unconscious, trapped or distressed people
- A crowd gathered around something, or emergency services already present
- Confrontation, violence, or a person who appears unsafe or followed
- Blocked roads, downed poles or wires, spills

is_emergency is FALSE only when the image is plainly unrelated to any incident:
a selfie or portrait with nothing happening, a meme, an app screenshot, food, a
pet, a document, or ordinary scenery.

WHEN UNCERTAIN, SET IT TRUE. A false positive costs an operator five seconds.
A missed accident costs far more. Recall matters more than precision here.

Severity: CRITICAL for life-threatening or active danger; HIGH for serious
damage or injury; MEDIUM for an accident aftermath with no visible casualty;
LOW only for a genuine non-incident.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" },
          },
          ...(caption
            ? [{ type: "text" as const, text: `Caption from sender: "${caption}"` }]
            : []),
        ],
      },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages,
        max_tokens: 600,
      }),
    });

    const data = await res.json();

    // An empty completion previously fell through to {} — every field
    // undefined — which the caller read as "not an emergency" and dropped the
    // photo silently. Fail OPEN instead: a human still needs to see that
    // someone sent a photograph to an emergency number.
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[vision] empty completion:", JSON.stringify(data).slice(0, 300));
      return NEEDS_REVIEW;
    }

    const parsed = JSON.parse(content);
    console.log(
      `[vision] is_emergency=${parsed.is_emergency} ${parsed.severity}/${parsed.category} :: ` +
        `${String(parsed.description || "").slice(0, 100)}`
    );

    return {
      description: parsed.description || "Image received",
      is_emergency: parsed.is_emergency !== false,
      severity: parsed.severity || "MEDIUM",
      category: parsed.category || "GENERAL",
      location: parsed.location || "",
      peopleCount: parsed.peopleCount || "Unknown",
      injuries: parsed.injuries || "",
      hazards: parsed.hazards || "",
      language: parsed.language || "Visual",
      response: parsed.response || "Image received. Emergency registered.",
    };
  } catch (err) {
    console.error("Image analysis error:", err);
    return null;
  }
}

/** Transcribe a Telegram voice message using OpenAI Whisper */
async function transcribeVoice(fileId: string): Promise<string | null> {
  if (!TELEGRAM_TOKEN || !OPENAI_KEY) return null;

  try {
    const audioUrl = await getTelegramFileUrl(fileId);
    if (!audioUrl) return null;

    const audioRes = await fetch(audioUrl);
    const audioBlob = await audioRes.blob();

    const formData = new FormData();
    formData.append("file", audioBlob, "voice.ogg");
    // gpt-4o-transcribe is materially better than whisper-1 on Indian
    // languages. Measured on the same Hindi clip, whisper-1 rendered
    // "आग" (fire) as "आत" — the one word the triage depends on.
    formData.append("model", "gpt-4o-transcribe");
    // Bias decoding toward emergency vocabulary without pinning a language,
    // which would defeat the point of a multilingual helpline.
    formData.append(
      "prompt",
      "Emergency call to India's 112 helpline. Possible words: आग, बाढ़, एम्बुलेंस, " +
        "पुलिस, दुर्घटना, मदद, फंस गया, खून, सांस, भूकंप, आग लगी, वाचवा, मदत, " +
        "fire, flood, ambulance, police, accident, help, trapped, bleeding."
    );

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: formData,
    });

    // OpenAI error bodies are valid JSON, so .json() succeeds and .text is
    // undefined — returning null with nothing logged looks identical to an
    // unintelligible clip. Log the real reason.
    if (!whisperRes.ok) {
      console.error("[transcribe] OpenAI error:", whisperRes.status, await whisperRes.text());
      return null;
    }
    const whisperData = await whisperRes.json();
    return (whisperData.text as string | undefined)?.trim() || null;
  } catch (err) {
    console.error("Voice transcription error:", err);
    return null;
  }
}

/** Send a message via Telegram Bot API */
async function sendTelegram(chatId: number, text: string) {
  if (!TELEGRAM_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set, skipping send");
    return;
  }

  // Replies interpolate untrusted transcript and model text inside _italics_.
  // One unmatched _ * [ or backtick makes Telegram reject the whole message,
  // so the bot would go silent after filing the case. Retry without markdown.
  const send = (mode?: string) =>
    fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(mode ? { parse_mode: mode } : {}),
      }),
    });

  const res = await send("Markdown");
  if (!res.ok) {
    console.error("[telegram] markdown send failed", res.status, await res.text());
    const plain = await send();
    if (!plain.ok) console.error("[telegram] plain retry failed", plain.status);
  }
}
