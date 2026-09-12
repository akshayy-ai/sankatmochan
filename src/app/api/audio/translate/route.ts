import { NextRequest, NextResponse } from "next/server";

/**
 * Audio Translation API — accepts audio file, returns transcription + translation + classification.
 *
 * POST /api/audio/translate
 * Body: FormData with "audio" file field
 *
 * Uses OpenAI Whisper for transcription, then GPT-4o-mini for translation + classification.
 * Supports all Indian languages that Whisper recognizes.
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided. Send as 'audio' field in FormData." }, { status: 400 });
    }

    // Step 1: Transcribe with Whisper (auto-detect language)
    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, "audio.webm");
    whisperForm.append("model", "whisper-1");
    whisperForm.append("response_format", "verbose_json");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      return NextResponse.json({ error: `Whisper API error: ${err}` }, { status: 502 });
    }

    const whisperData = await whisperRes.json();
    const transcript = whisperData.text || "";
    const detectedLang = whisperData.language || "unknown";

    if (!transcript.trim()) {
      return NextResponse.json({ error: "No speech detected in audio" }, { status: 400 });
    }

    // Step 2: Translate + classify with GPT-4o-mini
    const analysisRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: `You are a multilingual emergency translator for India's 112 helpline. The audio was transcribed by Whisper. Whisper detected the language as "${detectedLang}".

Respond with JSON:
{
  "language": "human-readable language name (Hindi, Marathi, Telugu, Tamil, Bengali, Gujarati, Kannada, Malayalam, Odia, Punjabi, English, etc.)",
  "transcript_original": "the original transcript, cleaned up if needed",
  "translation_english": "accurate English translation",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "category": "FLOOD | MEDICAL | FIRE | SAFETY | MISSING | ACCIDENT | DV | GENERAL",
  "location": "any location mentioned, or empty string",
  "key_entities": ["list of important entities: people, places, numbers, medical terms"],
  "summary": "one-line English summary for the operator dashboard"
}`,
          },
          { role: "user", content: transcript },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    const analysisData = await analysisRes.json();
    const analysis = JSON.parse(analysisData.choices?.[0]?.message?.content || "{}");

    return NextResponse.json({
      success: true,
      whisper: {
        transcript,
        detected_language: detectedLang,
        duration: whisperData.duration,
      },
      analysis: {
        language: analysis.language || detectedLang,
        transcript_original: analysis.transcript_original || transcript,
        translation_english: analysis.translation_english || transcript,
        severity: analysis.severity || "MEDIUM",
        category: analysis.category || "GENERAL",
        location: analysis.location || "",
        key_entities: analysis.key_entities || [],
        summary: analysis.summary || "",
      },
    });
  } catch (err) {
    console.error("Audio translate error:", err);
    return NextResponse.json({ error: `Processing failed: ${err}` }, { status: 500 });
  }
}
