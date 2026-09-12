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
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

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
      return NextResponse.json({ ok: true });
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
      return NextResponse.json({ ok: true });
    }

    // Handle location sharing
    if (message.location) {
      const { latitude, longitude } = message.location;
      await sendTelegram(chatId,
        `📍 Location received: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n\n` +
        "Now describe your emergency — type, voice note 🎤, or photo 📸"
      );
      return NextResponse.json({ ok: true });
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
        return NextResponse.json({ ok: true });
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

      return NextResponse.json({ ok: true, caseId, channel: "photo" });
    }

    // ── Handle voice messages ──────────────────────────────────
    if (message.voice || message.audio) {
      const fileId = message.voice?.file_id || message.audio?.file_id;
      if (!fileId) {
        await sendTelegram(chatId, "❌ Could not process audio. Please try again or type your emergency.");
        return NextResponse.json({ ok: true });
      }

      await sendTelegram(chatId, "🎤 _Transcribing your voice message..._");

      const transcript = await transcribeVoice(fileId);
      if (!transcript) {
        await sendTelegram(chatId, "❌ Could not transcribe audio. Please type your emergency instead.");
        return NextResponse.json({ ok: true });
      }

      const analysis = await analyzeEmergency(transcript);
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

      return NextResponse.json({ ok: true, caseId, channel: "voice" });
    }

    // ── Handle text messages ──────────────────────────────────
    if (!message.text) {
      return NextResponse.json({ ok: true });
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
      return NextResponse.json({ ok: true, is_emergency: false });
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

    return NextResponse.json({ ok: true, caseId });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
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
    formData.append("model", "whisper-1");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: formData,
    });

    const whisperData = await whisperRes.json();
    return whisperData.text || null;
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

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
}
