import { NextRequest, NextResponse } from "next/server";
import {
  addCase,
  listCases,
  nextCaseId,
  analyzeEmergency,
  type LiveCase,
} from "@/lib/caseStore";

/**
 * Telegram Bot Webhook — receives text, voice, AND image emergency messages
 * in any Indian language.
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
  return NextResponse.json({ cases, count: cases.length });
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
};

/** Runs after the webhook has already been acknowledged. */
async function processMessage(message: TelegramMessage) {
  try {
    const chatId = message.chat.id;
    const senderName =
      [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") ||
      "Unknown";

    // Handle /start command
    if (message.text === "/start") {
      await sendTelegram(chatId,
        "🚨 *Sankatmochan 112 Emergency Response*\n\n" +
        "Report emergencies in *any Indian language*:\n\n" +
        "📝 Type your emergency\n" +
        "🎤 Send a voice note\n" +
        "📸 Send a photo of the situation\n\n" +
        "आपातकालीन संदेश हिंदी में भेजें\n" +
        "మీ అత్యవసర సందేశాన్ని తెలుగులో పంపండి\n" +
        "तुमचा आणीबाणीचा संदेश मराठीत पाठवा\n\n" +
        "📍 Share your location for faster response.\n" +
        "📞 For phone emergencies, call 112."
      );
      return;
    }

    // Handle /help command
    if (message.text === "/help") {
      await sendTelegram(chatId,
        "📋 *How to report an emergency:*\n\n" +
        "1. 📝 Type, 🎤 voice note, or 📸 photo\n" +
        "2. 📍 Share your location (📎 → Location)\n" +
        "3. AI will transcribe, translate, classify and dispatch\n\n" +
        "📸 *Photos*: Send pictures of fires, floods, accidents, injuries — AI vision analyzes the scene\n\n" +
        "Supported: Hindi, Marathi, Telugu, Tamil, Bengali, Gujarati, Kannada, Malayalam, Odia, Punjabi, English"
      );
      return;
    }

    // Handle location sharing
    if (message.location) {
      const { latitude, longitude } = message.location;
      await sendTelegram(chatId,
        `📍 Location received: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n\n` +
        "Now describe your emergency — type, voice note 🎤, or photo 📸"
      );
      return;
    }

    // ── Handle photo messages ─────────────────────────────────
    if (message.photo && message.photo.length > 0) {
      // Telegram sends multiple sizes — pick the largest
      const photo = message.photo[message.photo.length - 1];
      const fileId = photo.file_id;

      await sendTelegram(chatId, "📸 _Analyzing emergency image..._");

      const imageAnalysis = await analyzeImage(fileId, message.caption);
      if (!imageAnalysis) {
        await sendTelegram(chatId, "❌ Could not analyze image. Please describe your emergency in text.");
        return;
      }

      if (!imageAnalysis.is_emergency) {
        await sendTelegram(chatId,
          `📸 _I see:_ _${imageAnalysis.description}_\n\n` +
          "🙏 This does not look like an emergency, so no case was raised.\n\n" +
          "If it is one, send a photo of the situation or describe it in words.\n\n" +
          "📞 For immediate help, call *112*"
        );
        return;
      }

      const caseId = nextCaseId("TG");

      const newCase: TelegramCase = {
        id: caseId,
        chatId,
        senderName,
        message: message.caption || "[Photo]",
        language: imageAnalysis.language,
        englishTranslation: imageAnalysis.description,
        severity: imageAnalysis.severity,
        category: imageAnalysis.category,
        timestamp: new Date().toISOString(),
        location: imageAnalysis.location || "Location not shared",
        channel: "PHOTO",
        imageAnalysis: imageAnalysis.description,
      };
      addCase(newCase);

      const sevEmoji =
        imageAnalysis.severity === "CRITICAL" ? "🔴" :
        imageAnalysis.severity === "HIGH" ? "🟠" :
        imageAnalysis.severity === "MEDIUM" ? "🔵" : "⚪";

      await sendTelegram(chatId,
        `${sevEmoji} *Case ${caseId} Created* (📸 Photo)\n\n` +
        `🔍 AI Analysis:\n_${imageAnalysis.description}_\n\n` +
        `📋 ${imageAnalysis.category} · ⚠️ ${imageAnalysis.severity}\n` +
        `👥 People visible: ${imageAnalysis.peopleCount}\n` +
        `${imageAnalysis.injuries ? `🩹 Injuries: _${imageAnalysis.injuries}_\n` : ""}` +
        `${imageAnalysis.hazards ? `⚠️ Hazards: _${imageAnalysis.hazards}_\n` : ""}` +
        `\n${imageAnalysis.response}` +
        `\n\n📍 Share your location for faster response.`
      );

      return;
    }

    // ── Handle voice messages ──────────────────────────────────
    if (message.voice || message.audio) {
      const fileId = message.voice?.file_id || message.audio?.file_id;
      if (!fileId) {
        await sendTelegram(chatId, "❌ Could not process audio. Please try again or type your emergency.");
        return;
      }

      await sendTelegram(chatId, "🎤 _Transcribing your voice message..._");

      const transcript = await transcribeVoice(fileId);
      if (!transcript) {
        await sendTelegram(chatId, "❌ Could not transcribe audio. Please type your emergency instead.");
        return;
      }

      const analysis = await analyzeEmergency(transcript);

      // Same gate the text path applies. Without it a casual voice note — or a
      // transcript the model could make no sense of — files a junk case, which
      // is how a NONE/GENERAL entry reached the operator queue.
      if (!analysis.is_emergency) {
        await sendTelegram(chatId,
          `🎤 _Heard:_ _${transcript}_\n\n` +
          "🙏 This is the *Sankatmochan 112 Emergency Helpline*.\n\n" +
          "If this is an emergency, describe it — type, voice note 🎤, or photo 📸.\n" +
          "If the transcription above is wrong, please try again or type instead.\n\n" +
          "📞 For immediate help, call *112*"
        );
        return;
      }

      const caseId = nextCaseId("TG");

      const newCase: TelegramCase = {
        id: caseId,
        chatId,
        senderName,
        message: transcript,
        language: analysis.language,
        englishTranslation: analysis.translation,
        severity: analysis.severity,
        category: analysis.category,
        timestamp: new Date().toISOString(),
        location: analysis.location || "Location not shared",
        channel: "VOICE",
        audioTranscript: transcript,
      };
      addCase(newCase);

      const sevEmoji =
        analysis.severity === "CRITICAL" ? "🔴" :
        analysis.severity === "HIGH" ? "🟠" :
        analysis.severity === "MEDIUM" ? "🔵" : "⚪";

      await sendTelegram(chatId,
        `${sevEmoji} *Case ${caseId} Created* (🎤 Voice)\n\n` +
        `🎤 Transcript:\n_${transcript}_\n\n` +
        `🔄 Translation:\n_${analysis.translation}_\n\n` +
        `📋 ${analysis.category} · ⚠️ ${analysis.severity} · 🗣️ ${analysis.language}\n\n` +
        (analysis.response || "Your emergency has been registered.") +
        `\n\n📍 Share your location for faster response.`
      );

      return;
    }

    // ── Handle text messages ──────────────────────────────────
    if (!message.text) {
      return;
    }

    const text = message.text;
    const analysis = await analyzeEmergency(text);

    // ── Normal conversation — no case created ──
    if (!analysis.is_emergency) {
      await sendTelegram(chatId,
        analysis.response ||
        "🙏 This is the *Sankatmochan 112 Emergency Helpline*.\n\n" +
        "To report an emergency:\n" +
        "📝 Type your emergency\n" +
        "🎤 Send a voice note\n" +
        "📸 Send a photo\n" +
        "📍 Share your location\n\n" +
        "📞 For immediate help, call *112*"
      );
      return;
    }

    // ── Emergency — create case ──
    const caseId = nextCaseId("TG");

    const newCase: TelegramCase = {
      id: caseId,
      chatId,
      senderName,
      message: text,
      language: analysis.language,
      englishTranslation: analysis.translation,
      severity: analysis.severity,
      category: analysis.category,
      timestamp: new Date().toISOString(),
      location: analysis.location || "Location not shared",
      channel: "TEXT",
    };
    addCase(newCase);

    const sevEmoji =
      analysis.severity === "CRITICAL" ? "🔴" :
      analysis.severity === "HIGH" ? "🟠" :
      analysis.severity === "MEDIUM" ? "🔵" : "⚪";

    await sendTelegram(chatId,
      `${sevEmoji} *Case ${caseId} Created*\n\n` +
      `📋 Category: ${analysis.category}\n` +
      `⚠️ Severity: ${analysis.severity}\n` +
      `🗣️ Language: ${analysis.language}\n\n` +
      `🔄 Translation:\n_${analysis.translation}_\n\n` +
      (analysis.response || "Your emergency has been registered. Help is being dispatched.") +
      `\n\n📍 Share your location for faster response.`
    );

  } catch (err) {
    console.error("Telegram webhook error:", err);
  }
}

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
    const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const messages: any[] = [
      {
        role: "system",
        content: `You are an emergency scene analyst for India's 112 helpline. Analyze the photo and respond with JSON:
{
  "is_emergency": true or false — does this image actually show an emergency, hazard, injury or person in danger? A selfie, screenshot, meme, pet, food or ordinary scene is false,
  "description": "What you see in the image — describe the emergency situation clearly",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "category": "FLOOD | MEDICAL | FIRE | SAFETY | MISSING | ACCIDENT | DV | GENERAL",
  "location": "any identifiable location clues (signs, landmarks, building names)",
  "peopleCount": "estimated number of people visible or 'None visible'",
  "injuries": "description of any visible injuries, or empty string",
  "hazards": "immediate hazards visible (fire, water, collapsed structure, etc.), or empty string",
  "language": "if there is text/signage in the image, what language, otherwise 'Visual'",
  "response": "Brief response to the sender acknowledging the emergency and what help is being dispatched"
}

Be specific about what you see. If the image is not an emergency, classify as LOW/GENERAL.`,
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
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
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
