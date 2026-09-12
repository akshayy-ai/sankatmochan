/**
 * Shared in-memory case store.
 *
 * Every ingest channel (Telegram text/voice/photo, Vobiz phone calls) writes
 * here, and the operator console polls it, so a case raised from any channel
 * lands in the same queue.
 *
 * In-memory is deliberate for the demo: no DB to provision, and the console
 * polls the same process. It resets on redeploy.
 */

export type LiveCase = {
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
  channel: "TEXT" | "VOICE" | "PHOTO" | "CALL" | "SMS";
  audioTranscript?: string;
  imageAnalysis?: string;
  /** Vobiz call identifier, when the case came in over the phone */
  callUuid?: string;
  callerNumber?: string;
};

const MAX_CASES = 50;

const cases: LiveCase[] = [];

export function addCase(c: LiveCase) {
  cases.unshift(c);
  if (cases.length > MAX_CASES) cases.length = MAX_CASES;
}

export function listCases(): LiveCase[] {
  return cases;
}

/** Find the most recent case raised by a given phone call. */
export function findByCallUuid(callUuid: string): LiveCase | undefined {
  return cases.find((c) => c.callUuid === callUuid);
}

export function nextCaseId(prefix: string): string {
  return `${prefix}-${String(Date.now()).slice(-6)}`;
}

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

export type Analysis = {
  language: string;
  translation: string;
  severity: string;
  category: string;
  location: string;
  response: string;
  is_emergency: boolean;
};

const FALLBACK: Analysis = {
  language: "Unknown",
  translation: "",
  severity: "MEDIUM",
  category: "GENERAL",
  location: "",
  response: "Emergency registered.",
  is_emergency: true,
};

/**
 * Detect language, translate, and triage an inbound message.
 *
 * `spokenReply` asks for a reply written to be read aloud by TTS — no markdown,
 * no parentheticals — which is what the phone channel needs.
 */
export async function analyzeEmergency(
  text: string,
  opts: { spokenReply?: boolean } = {}
): Promise<Analysis> {
  if (!OPENAI_KEY) return { ...FALLBACK, translation: text };

  const replyRule = opts.spokenReply
    ? `"response": "A short reply in the SAME LANGUAGE as the caller, written to be READ ALOUD over a phone line. Two sentences maximum. Confirm help is coming and state the case number will follow. No markdown, no emoji, no English translation in brackets."`
    : `"response": "If is_emergency=true: a brief acknowledgment in the SAME LANGUAGE as the input, reassuring the caller that help is being dispatched, with English translation in parentheses. If is_emergency=false: a friendly conversational reply in the SAME LANGUAGE, reminding them this is an emergency helpline and how to report emergencies."`;

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
  "is_emergency": true or false — is this an actual emergency or distress report? Greetings, thank you, general questions, casual chat = false. Actual emergencies, accidents, fires, floods, medical distress, violence, missing persons = true,
  "language": "detected language name (Hindi, Marathi, Telugu, Tamil, Bengali, Gujarati, Kannada, Malayalam, Odia, Punjabi, English, etc.)",
  "translation": "English translation of the message",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW | NONE",
  "category": "FLOOD | MEDICAL | FIRE | SAFETY | MISSING | ACCIDENT | DV | GENERAL",
  "location": "any location mentioned in the message, or empty string",
  ${replyRule}
}

Severity guide:
- CRITICAL: life-threatening, active danger, trapped, drowning, cardiac arrest
- HIGH: serious injury, building collapse, fire, violence
- MEDIUM: non-life-threatening medical, minor accident, property damage
- LOW: information request, non-urgent report
- NONE: not an emergency at all`,
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
      // The prompt defines NONE as "not an emergency at all", so reconcile the
      // two fields rather than trusting is_emergency alone — a NONE severity
      // with is_emergency omitted is how a junk case reached the queue.
      is_emergency: parsed.is_emergency !== false && parsed.severity !== "NONE",
    };
  } catch {
    return { ...FALLBACK, translation: text };
  }
}
