/**
 * /api/realtime/session — Ephemeral token for OpenAI Realtime API.
 *
 * The browser requests a short-lived token (60 s) so the WebRTC
 * connection authenticates directly with OpenAI without exposing
 * the API key client-side.
 */
import { NextResponse } from "next/server";

const SANKATMOCHAN_VOICE_INSTRUCTIONS = `You are the Sankatmochan 112 Emergency Response Voice Agent — India's multilingual emergency helpline.

CRITICAL RULES:
1. You handle REAL emergencies. Be calm, professional, and efficient.
2. Detect the caller's language automatically — respond in THEIR language.
3. Supported: Hindi, Marathi, Telugu, Tamil, Bengali, Gujarati, Kannada, Malayalam, Odia, Punjabi, English.
4. Gather these details quickly:
   - What is the emergency? (fire, flood, medical, collapse, accident, missing person)
   - Where exactly? (landmark, area, city)
   - How many people affected?
   - Is anyone injured? How severely?
   - Caller's name and callback number
5. Classify severity: CRITICAL (life-threatening), HIGH (serious injury), MEDIUM (property damage), LOW (non-urgent)
6. After gathering info, confirm back in the caller's language and say help is being dispatched.
7. Keep responses SHORT — 1-2 sentences max. This is an emergency line, not a conversation.
8. If the caller is panicking, use a slower, reassuring tone.
9. Use the create_emergency_case tool to log the case once you have enough information.
10. Never hang up first — let the caller know you're staying on the line.

GREETING (adapt to detected language):
Hindi: "नमस्कार, यह संकटमोचन 112 इमरजेंसी लाइन है। क्या हुआ? बताइए।"
English: "Sankatmochan 112 Emergency. What is your emergency?"
Marathi: "नमस्कार, संकटमोचन 112 इमरजेंसी. काय झालं? सांगा."
Telugu: "నమస్కారం, సంకటమోచన్ 112 ఎమర్జెన్సీ. ఏం జరిగింది?"
Tamil: "வணக்கம், சங்கடமோசன் 112 அவசரநிலை. என்ன நடந்தது?"`;

const VOICE_TOOLS = [
  {
    type: "function" as const,
    name: "create_emergency_case",
    description:
      "Log a new emergency case from the voice call. Call this once you have the caller's emergency type, location, and severity assessment.",
    parameters: {
      type: "object",
      properties: {
        emergency_type: {
          type: "string",
          enum: ["FLOOD", "FIRE", "MEDICAL", "COLLAPSE", "ACCIDENT", "MISSING_PERSON", "GAS_LEAK", "OTHER"],
          description: "Type of emergency",
        },
        severity: {
          type: "string",
          enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
          description: "Assessed severity level",
        },
        location: {
          type: "string",
          description: "Location described by the caller (area, landmark, city)",
        },
        language: {
          type: "string",
          description: "Language the caller is speaking (e.g. Hindi, Marathi, Telugu)",
        },
        description_english: {
          type: "string",
          description: "English summary of the emergency situation",
        },
        description_native: {
          type: "string",
          description: "Description in the caller's native language",
        },
        people_affected: {
          type: "number",
          description: "Estimated number of people affected",
        },
        injuries: {
          type: "string",
          description: "Description of injuries if any",
        },
        caller_name: {
          type: "string",
          description: "Caller's name if provided",
        },
      },
      required: ["emergency_type", "severity", "location", "language", "description_english"],
    },
  },
  {
    type: "function" as const,
    name: "dispatch_emergency_unit",
    description:
      "Request dispatch of an emergency unit to the caller's location. Use after creating the case and confirming details with the caller.",
    parameters: {
      type: "object",
      properties: {
        agency: {
          type: "string",
          enum: ["NDRF", "SDRF", "HOSPITAL", "FIRE", "POLICE"],
          description: "Which emergency agency to dispatch",
        },
        location: {
          type: "string",
          description: "Dispatch location",
        },
        priority: {
          type: "string",
          enum: ["IMMEDIATE", "URGENT", "STANDARD"],
          description: "Dispatch priority",
        },
        unit_type: {
          type: "string",
          description: "Type of unit needed (ambulance, fire truck, rescue team, etc.)",
        },
      },
      required: ["agency", "location", "priority"],
    },
  },
];

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-realtime",
          voice: "coral",
          modalities: ["audio", "text"],
          instructions: SANKATMOCHAN_VOICE_INSTRUCTIONS,
          tools: VOICE_TOOLS,
          tool_choice: "auto",
          input_audio_transcription: {
            model: "gpt-realtime-whisper",
          },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("[realtime/session] OpenAI error:", response.status, err);
      return NextResponse.json(
        { error: `OpenAI session error: ${response.status}`, details: err },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[realtime/session] Error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 },
    );
  }
}
