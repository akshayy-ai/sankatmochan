import { NextRequest, NextResponse } from "next/server";

/**
 * Reverse geocoding via OpenStreetMap Nominatim (free, no API key).
 * Converts lat,lng → human-readable address.
 *
 * GET /api/geocode?lat=16.85&lng=74.58
 */
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16`,
      {
        headers: {
          "User-Agent": "Sankatmochan-112-ERC/1.0 (hackathon-demo)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
    }

    const data = await res.json();
    const addr = data.address || {};

    return NextResponse.json({
      display: data.display_name,
      short: [
        addr.suburb || addr.neighbourhood || addr.village || "",
        addr.city || addr.town || addr.county || "",
        addr.state || "",
      ]
        .filter(Boolean)
        .join(", "),
      district: addr.state_district || addr.county || "",
      state: addr.state || "",
      city: addr.city || addr.town || addr.village || "",
      area: addr.suburb || addr.neighbourhood || "",
      postcode: addr.postcode || "",
      country: addr.country || "",
    });
  } catch {
    return NextResponse.json({ error: "Geocoding unavailable" }, { status: 502 });
  }
}
