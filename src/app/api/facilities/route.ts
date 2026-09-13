import { NextRequest, NextResponse } from "next/server";

/**
 * Nearest emergency facilities to an incident, from OpenStreetMap.
 *
 * GET /api/facilities?lat=18.50&lng=73.80
 *
 * Overpass is the right source here rather than a web search: it returns
 * structured amenities with coordinates, so "the fire station 3.6 km away" is
 * a fact rather than a page that mentions one. Free, and no key.
 *
 * Dispatch is a decision made under time pressure, so this never blocks it —
 * on timeout or failure the caller still dispatches to the agency, just
 * without a named station.
 */

const OVERPASS = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";
const RADIUS_M = 8000;
const TIMEOUT_MS = 9000;

type Facility = {
  type: "police" | "fire_station" | "hospital";
  name: string;
  lat: number;
  lon: number;
  km: number;
  phone?: string;
  /** Road distance in km, when routing succeeded. */
  roadKm?: number;
  /** Free-flow drive time in minutes. NOT traffic-aware — see routeEta(). */
  etaMin?: number;
};

const OSRM = process.env.OSRM_URL || "https://router.project-osrm.org";

/**
 * Road drive time from the incident to a facility.
 *
 * This is FREE-FLOW time: OSRM's public server has no live traffic, so in
 * Pune at 6pm the real figure is worse. It is shown to an operator, who can
 * weigh it, and deliberately never spoken to a caller — an ETA given to
 * someone in a burning building can stop them self-rescuing, and this system
 * dispatches no vehicle to make it true.
 */
async function routeEta(
  fromLat: number, fromLon: number, toLat: number, toLon: number
): Promise<{ roadKm: number; etaMin: number } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const url = `${OSRM}/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Sankatmochan-112-ERC/1.0" },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const d = await res.json();
    const r = d?.routes?.[0];
    if (!r) return null;
    return {
      roadKm: Math.round((r.distance / 1000) * 100) / 100,
      etaMin: Math.max(1, Math.round(r.duration / 60)),
    };
  } catch {
    return null;
  }
}

/** Straight-line distance. Road distance would be better; this is honest about being neither. */
function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(bLat - aLat);
  const dLon = r(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 100) / 100;
}

// Overpass is shared infrastructure and rate-limits; a case's location does
// not move, so the same query is only ever asked once.
const cache = new Map<string, { at: number; data: Facility[] }>();
const CACHE_TTL = 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") || "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") || "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) {
    return NextResponse.json({ facilities: hit.data, cached: true });
  }

  const query = `
[out:json][timeout:20];
(
  node["amenity"="police"](around:${RADIUS_M},${lat},${lng});
  way["amenity"="police"](around:${RADIUS_M},${lat},${lng});
  node["amenity"="fire_station"](around:${RADIUS_M},${lat},${lng});
  way["amenity"="fire_station"](around:${RADIUS_M},${lat},${lng});
  node["amenity"="hospital"](around:${RADIUS_M},${lat},${lng});
  way["amenity"="hospital"](around:${RADIUS_M},${lat},${lng});
);
out center 40;`;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const res = await fetch(OVERPASS, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Sankatmochan-112-ERC/1.0 (emergency dispatch)",
      },
      body: new URLSearchParams({ data: query }).toString(),
      signal: ctrl.signal,
    });
    clearTimeout(t);

    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const data = await res.json();

    const facilities: Facility[] = (data.elements || [])
      .map((el: Record<string, unknown>) => {
        const tags = (el.tags || {}) as Record<string, string>;
        const center = el.center as { lat: number; lon: number } | undefined;
        const eLat = (el.lat as number) ?? center?.lat;
        const eLon = (el.lon as number) ?? center?.lon;
        if (!Number.isFinite(eLat) || !Number.isFinite(eLon)) return null;
        return {
          type: tags.amenity as Facility["type"],
          name: tags.name || tags["name:en"] || "(unnamed)",
          lat: eLat,
          lon: eLon,
          km: haversineKm(lat, lng, eLat, eLon),
          phone: tags.phone || tags["contact:phone"],
        };
      })
      .filter(Boolean)
      .sort((a: Facility, b: Facility) => a.km - b.km);

    // Unnamed points are unusable to a dispatcher, so they are only kept when
    // nothing named exists nearby.
    const named = facilities.filter((f) => f.name !== "(unnamed)");
    const out = (named.length ? named : facilities).slice(0, 24);

    // Route only the nearest of each type. Routing all 24 would triple the
    // latency of a screen an operator is waiting on, for facilities they will
    // never dispatch.
    const firstOfType = new Map<string, Facility>();
    for (const f of out) if (!firstOfType.has(f.type)) firstOfType.set(f.type, f);

    await Promise.all(
      [...firstOfType.values()].map(async (f) => {
        const r = await routeEta(lat, lng, f.lat, f.lon);
        if (r) {
          f.roadKm = r.roadKm;
          f.etaMin = r.etaMin;
        }
      })
    );

    cache.set(key, { at: Date.now(), data: out });
    return NextResponse.json({
      facilities: out,
      cached: false,
      etaNote: "free-flow drive time, not traffic-aware",
    });
  } catch (err) {
    console.error("[facilities] lookup failed:", err);
    // Degrade quietly: dispatch proceeds to the agency without a named station.
    return NextResponse.json({ facilities: [], error: String(err) }, { status: 200 });
  }
}
