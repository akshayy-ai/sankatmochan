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
        content: `You are an emergency scene analyst for India's 112 helpline (Sankatmochan system).
Analyze the image and respond with JSON:
{
  "description": "Detailed description of the emergency scene",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "category": "FLOOD | MEDICAL | FIRE | SAFETY | MISSING | ACCIDENT | DV | GENERAL",
  "location_clues": "Any identifiable location clues (road signs, building names, landmarks, vehicle plates)",
  "people_count": "Estimated number of people visible, or 'None visible'",
  "injuries": "Description of any visible injuries or medical conditions, or empty string",
  "hazards": "Immediate hazards visible (active fire, rising water, structural damage, gas leak, exposed wires), or empty string",
  "vehicles": "Any vehicles involved (type, color, condition), or empty string",
  "weather_conditions": "Observable weather from the image (rain, fog, night), or empty string",
  "recommended_units": ["list of units to dispatch: POLICE, AMBULANCE, FIRE, RESCUE, NDRF"],
  "urgency_factors": ["list of factors increasing urgency: trapped_persons, children_involved, spreading_fire, rising_water, etc."],
  "summary": "One-line summary for operator dashboard"
}

Severity guide:
- CRITICAL: life-threatening, active danger, multiple casualties, trapped persons, large-scale fire/flood
- HIGH: serious injury, significant property damage, imminent danger
- MEDIUM: non-life-threatening injuries, contained hazard, minor property damage
- LOW: no visible injuries, informational, non-emergency scene

If the image is not an emergency, classify as LOW/GENERAL and note that.`,
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

    return NextResponse.json({
      success: true,
      analysis: {
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
