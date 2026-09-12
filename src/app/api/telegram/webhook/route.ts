import { NextRequest, NextResponse } from "next/server";

/**
 * Telegram Bot Webhook — receives emergency messages in any Indian language.
 *
 * Flow:
 * 1. User sends message in Hindi/Marathi/Telugu/etc. to the bot
 * 2. OpenAI detects language + classifies emergency
 * 3. Bot replies with case ID + acknowledgment in their language
 * 4. Case is added to the live dashboard queue
 *
 * POST /api/telegram/webhook
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

// In-memory case store (shared with the dashboard via GET endpoint)
const telegramCases: TelegramCase[] = [];

export type TelegramCase = {
  id: string;
  chatId: number;
  senderName: string;
  message: string;
  language: string;
  englishTranslation: string;
  severity: string;
  category: string;
  timestamp: string;
  location: string;
};

// GET — dashboard can poll for new Telegram cases
export async function GET() {
  return NextResponse.json({ cases: telegramCases, count: telegramCases.length });
}

// POST — Telegram sends updates here
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;
    const senderName =
      [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") ||
      "Unknown";

    // Handle /start command
    if (text === "/start") {
      await sendTelegram(chatId,
        "🚨 *Sankatmochan 112 Emergency Response*\n\n" +
        "Send your emergency message in *any Indian language*.\n\n" +
        "आपातकालीन संदेश हिंदी में भेजें\n" +
        "మీ అత్యవసర సందేశాన్ని తెలుగులో పంపండి\n" +
        "तुमचा आणीबाणीचा संदेश मराठीत पाठवा\n\n" +
        "📍 Share your location for faster response.\n" +
        "📞 For voice emergencies, call 112."
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (text === "/help") {
      await sendTelegram(chatId,
        "📋 *How to report an emergency:*\n\n" +
        "1. Type your emergency in your language\n" +
        "2. Share your location (📎 → Location)\n" +
        "3. We'll classify and dispatch help\n\n" +
        "Supported: Hindi, Marathi, Telugu, Tamil, Bengali, Gujarati, Kannada, Malayalam, Odia, Punjabi, English"
      );
      return NextResponse.json({ ok: true });
    }

    // Handle location sharing
    if (message.location) {
      const { latitude, longitude } = message.location;
      await sendTelegram(chatId,
        `📍 Location received: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n\n` +
        "Now describe your emergency in your language."
      );
      return NextResponse.json({ ok: true });
    }

    // Process emergency message with OpenAI
    const analysis = await analyzeEmergency(text);

    // Generate case ID
    const caseId = `TG-${String(Date.now()).slice(-6)}`;

    // Store the case
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
    };
    telegramCases.unshift(newCase);

    // Keep only last 50 cases in memory
    if (telegramCases.length > 50) telegramCases.length = 50;

    // Reply to the user in their language + English
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

/** Use OpenAI to detect language, translate, classify emergency */
async function analyzeEmergency(text: string): Promise<{
  language: string;
  translation: string;
  severity: string;
  category: string;
  location: string;
  response: string;
}> {
  if (!OPENAI_KEY) {
    return {
      language: "Unknown",
      translation: text,
      severity: "MEDIUM",
      category: "GENERAL",
      location: "",
      response: "Emergency registered. Please share more details.",
    };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an emergency triage AI for India's 112 helpline. Analyze the incoming message and respond with JSON:
{
  "language": "detected language name (Hindi, Marathi, Telugu, Tamil, Bengali, etc.)",
  "translation": "English translation of the message",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "category": "FLOOD | MEDICAL | FIRE | SAFETY | MISSING | ACCIDENT | DV | GENERAL",
  "location": "any location mentioned in the message, or empty string",
  "response": "A brief acknowledgment in the SAME LANGUAGE as the input, reassuring the caller that help is being dispatched. Include the English translation in parentheses."
}

Severity guide:
- CRITICAL: life-threatening, active danger, trapped, drowning, cardiac arrest
- HIGH: serious injury, building collapse, fire, violence
- MEDIUM: non-life-threatening medical, minor accident, property damage
- LOW: information request, non-urgent report`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return {
      language: parsed.language || "Unknown",
      translation: parsed.translation || text,
      severity: parsed.severity || "MEDIUM",
      category: parsed.category || "GENERAL",
      location: parsed.location || "",
      response: parsed.response || "",
    };
  } catch {
    return {
      language: "Unknown",
      translation: text,
      severity: "MEDIUM",
      category: "GENERAL",
      location: "",
      response: "Emergency registered.",
    };
  }
}
