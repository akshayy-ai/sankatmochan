import { NextRequest, NextResponse } from "next/server";

/**
 * Weather data via wttr.in (free, no API key, no signup).
 * Returns current conditions at a lat,lng.
 *
 * GET /api/weather?lat=16.85&lng=74.58
 */
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://wttr.in/${lat},${lng}?format=j1`, {
      headers: {
        "User-Agent": "Sankatmochan-112-ERC/1.0 (hackathon-demo)",
        Accept: "application/json",
      },
      next: { revalidate: 600 }, // Cache for 10 min
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Weather fetch failed" }, { status: 502 });
    }

    const data = await res.json();
    const current = data.current_condition?.[0];
    const area = data.nearest_area?.[0];

    if (!current) {
      return NextResponse.json({ error: "No weather data" }, { status: 502 });
    }

    // Map weather codes to emoji
    const code = parseInt(current.weatherCode, 10);
    let emoji = "☀️";
    if (code >= 200 && code < 300) emoji = "⛈️"; // Thunderstorm
    else if (code >= 300 && code < 400) emoji = "🌧️"; // Drizzle
    else if (code >= 500 && code < 600) emoji = "🌧️"; // Rain
    else if (code >= 600 && code < 700) emoji = "❄️"; // Snow
    else if (code >= 700 && code < 800) emoji = "🌫️"; // Fog
    else if (code === 800 || code === 113) emoji = "☀️"; // Clear
    else if (code > 800 || (code >= 116 && code <= 122)) emoji = "⛅"; // Cloudy
    // wttr.in specific codes
    if (current.weatherDesc?.[0]?.value?.toLowerCase().includes("rain")) emoji = "🌧️";
    if (current.weatherDesc?.[0]?.value?.toLowerCase().includes("thunder")) emoji = "⛈️";
    if (current.weatherDesc?.[0]?.value?.toLowerCase().includes("cloud")) emoji = "⛅";
    if (current.weatherDesc?.[0]?.value?.toLowerCase().includes("clear") ||
        current.weatherDesc?.[0]?.value?.toLowerCase().includes("sunny")) emoji = "☀️";
    if (current.weatherDesc?.[0]?.value?.toLowerCase().includes("fog") ||
        current.weatherDesc?.[0]?.value?.toLowerCase().includes("mist")) emoji = "🌫️";
    if (current.weatherDesc?.[0]?.value?.toLowerCase().includes("overcast")) emoji = "☁️";

    return NextResponse.json({
      temp_c: current.temp_C,
      feels_like_c: current.FeelsLikeC,
      condition: current.weatherDesc?.[0]?.value || "Unknown",
      emoji,
      humidity: current.humidity,
      wind_kmph: current.windspeedKmph,
      wind_dir: current.winddir16Point,
      precip_mm: current.precipMM,
      visibility_km: current.visibility,
      uv_index: current.uvIndex,
      nearest_area: area?.areaName?.[0]?.value || "",
      region: area?.region?.[0]?.value || "",
      observation_time: current.observation_time,
    });
  } catch {
    return NextResponse.json({ error: "Weather service unavailable" }, { status: 502 });
  }
}
