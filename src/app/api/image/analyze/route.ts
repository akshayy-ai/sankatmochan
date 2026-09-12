import { NextRequest, NextResponse } from "next/server";

/**
 * Image Analysis API — accepts an image file, returns emergency scene analysis.
 *
 * POST /api/image/analyze
 * Body: FormData with "image" file field + optional "context" text field
 *
 * Uses GPT-4o Vision to analyze emergency scenes (fires, floods, accidents, injuries).
 * Returns structured classification for the operator dashboard.
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as Blob | null;
    const context = (formData.get("context") as string) || "";

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided. Send as 'image' field in FormData." },
        { status: 400 }
      );
    }

    // Convert image to base64 data URL
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Analyze with GPT-4o Vision
    const messages: any[] = [
      {
        role: "system",
        content: `You are an emergency scene analyst for India's 112 helpline
(Sankatmochan system).

Someone deliberately sent this photograph TO AN EMERGENCY NUMBER. Assume they
had a reason. The question is not "is a disaster unfolding in this frame right
now" — it is "would a responder want to see this?"

Respond with JSON:
{
  "is_emergency": true or false — see the rule below,
  "description": "Detailed description of the scene",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "category": "FLOOD | MEDICAL | FIRE | SAFETY | MISSING | ACCIDENT | DV | GENERAL",
  "location_clues": "road signs, building names, landmarks, vehicle plates",
  "people_count": "estimated number visible, or 'None visible'",
  "injuries": "visible injuries or medical conditions, or empty string",
  "hazards": "active fire, rising water, structural damage, exposed wires, spills",
  "vehicles": "vehicles involved (type, colour, condition), or empty string",
  "weather_conditions": "observable weather (rain, fog, night), or empty string",
  "recommended_units": ["POLICE, AMBULANCE, FIRE, RESCUE, NDRF"],
  "urgency_factors": ["trapped_persons, children_involved, spreading_fire, ..."],
  "summary": "One-line summary for the operator dashboard"
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
          ...(context
            ? [{ type: "text" as const, text: `Caller's description: "${context}"` }]
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
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `OpenAI API error: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    const analysis = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    console.log(
      `[vision] is_emergency=${analysis.is_emergency} ${analysis.severity}/${analysis.category} :: ` +
        `${String(analysis.summary || "").slice(0, 100)}`
    );

    return NextResponse.json({
      success: true,
      analysis: {
        is_emergency: analysis.is_emergency !== false,
        description: analysis.description || "Image received",
        severity: analysis.severity || "MEDIUM",
        category: analysis.category || "GENERAL",
        location_clues: analysis.location_clues || "",
        people_count: analysis.people_count || "Unknown",
        injuries: analysis.injuries || "",
        hazards: analysis.hazards || "",
        vehicles: analysis.vehicles || "",
        weather_conditions: analysis.weather_conditions || "",
        recommended_units: analysis.recommended_units || [],
        urgency_factors: analysis.urgency_factors || [],
        summary: analysis.summary || "",
      },
      model: "gpt-4o",
      usage: data.usage,
    });
  } catch (err) {
    console.error("Image analysis error:", err);
    return NextResponse.json({ error: `Processing failed: ${err}` }, { status: 500 });
  }
}
