import type { CrisisCase } from "@/data/mock";
import { REPORT_TEMPLATES, type ReportTemplate } from "@/data/reportTemplates";

/**
 * Builds the seeded demo corpus.
 *
 * DEMO DATA, and the product says so everywhere it surfaces: these cases carry
 * `isLive: false`, the Pipeline tab excludes them from its traffic counts, and
 * the stats view labels them. They exist to show the console at the scale a real
 * shift produces — a queue of nine cases cannot demonstrate clustering, SLA
 * pressure or language spread.
 *
 * DETERMINISTIC BY CONSTRUCTION. Next renders this on the server and again on
 * the client; anything drawn from Math.random() or Date.now() at module scope
 * would differ between the two and throw a hydration mismatch. A seeded PRNG and
 * an explicit epoch mean both passes build byte-identical cases.
 */

/** mulberry32 — small, fast, and stable across engines. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(r: () => number, xs: T[]): T => xs[Math.floor(r() * xs.length)];

/**
 * Where a caller of each language plausibly is.
 *
 * Localities are generic (a ward, a road, a bus stand) rather than real street
 * addresses. Coordinates are city-level with jitter applied per case, so the map
 * shows plausible spread without any of them resolving to a real doorstep.
 */
const PLACES: Record<string, { city: string; lat: number; lon: number; areas: string[] }[]> = {
  "hi-IN": [
    { city: "Nagpur", lat: 21.1458, lon: 79.0882, areas: ["Itwari", "Sadar", "Dharampeth", "Jaripatka"] },
    { city: "Lucknow", lat: 26.8467, lon: 80.9462, areas: ["Aminabad", "Gomti Nagar", "Alambagh"] },
    { city: "Patna", lat: 25.5941, lon: 85.1376, areas: ["Kankarbagh", "Boring Road", "Patna City"] },
  ],
  "mr-IN": [
    { city: "Pune", lat: 18.5204, lon: 73.8567, areas: ["Kothrud", "Hadapsar", "Pimpri", "Deccan"] },
    { city: "Nashik", lat: 19.9975, lon: 73.7898, areas: ["Panchavati", "Satpur", "Gangapur Road"] },
  ],
  "te-IN": [
    { city: "Hyderabad", lat: 17.385, lon: 78.4867, areas: ["Kukatpally", "LB Nagar", "Secunderabad"] },
    { city: "Vijayawada", lat: 16.5062, lon: 80.648, areas: ["Benz Circle", "Gunadala", "Patamata"] },
  ],
  "ta-IN": [
    { city: "Chennai", lat: 13.0827, lon: 80.2707, areas: ["Velachery", "T. Nagar", "Tambaram"] },
    { city: "Coimbatore", lat: 11.0168, lon: 76.9558, areas: ["Gandhipuram", "Peelamedu", "Singanallur"] },
  ],
  "bn-IN": [
    { city: "Kolkata", lat: 22.5726, lon: 88.3639, areas: ["Baguiati", "Behala", "Salt Lake", "Howrah"] },
    { city: "Siliguri", lat: 26.7271, lon: 88.3953, areas: ["Hakimpara", "Pradhan Nagar"] },
  ],
  "gu-IN": [
    { city: "Ahmedabad", lat: 23.0225, lon: 72.5714, areas: ["Maninagar", "Naroda", "Vastrapur"] },
    { city: "Rajkot", lat: 22.3039, lon: 70.8022, areas: ["Gondal Road", "Kalawad Road"] },
  ],
  "pa-IN": [
    { city: "Ludhiana", lat: 30.901, lon: 75.8573, areas: ["Focal Point", "Model Town", "Tajpur Road"] },
    { city: "Amritsar", lat: 31.634, lon: 74.8723, areas: ["Ranjit Avenue", "Majitha Road"] },
  ],
  "kn-IN": [
    { city: "Bengaluru", lat: 12.9716, lon: 77.5946, areas: ["Koramangala", "Yelahanka", "Whitefield"] },
    { city: "Mysuru", lat: 12.2958, lon: 76.6394, areas: ["Kuvempunagar", "Vijayanagar"] },
  ],
  "ml-IN": [
    { city: "Kochi", lat: 9.9312, lon: 76.2673, areas: ["Kaloor", "Edappally", "Fort Kochi"] },
    { city: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366, areas: ["Pattom", "Kazhakkoottam"] },
  ],
  "or-IN": [
    { city: "Cuttack", lat: 20.4625, lon: 85.8828, areas: ["Mangalabag", "Badambadi", "Ward 5"] },
    { city: "Bhubaneswar", lat: 20.2961, lon: 85.8245, areas: ["Saheed Nagar", "Old Town"] },
  ],
  // Visitors are wherever tourists and business travellers actually are, and
  // crucially they cannot name the locality — hence the "unknown" areas.
  ja: [{ city: "Pune", lat: 18.5204, lon: 73.8567, areas: ["hotel district — caller cannot name area"] }],
  es: [{ city: "Goa", lat: 15.2993, lon: 74.124, areas: ["beach area — caller cannot name area"] }],
  ar: [{ city: "Mumbai", lat: 19.076, lon: 72.8777, areas: ["market area — caller cannot name area"] }],
};

const CHANNELS: CrisisCase["channel"][] = ["TELEGRAM", "TG VOICE", "TG PHOTO", "SMS", "112 CALL"];

/** Which agencies a category actually routes to. Mirrors lib/dispatchRouting. */
const AGENCIES: Record<string, string[]> = {
  FIRE: ["Fire Brigade", "Ambulance"],
  FLOOD: ["NDRF", "SDRF"],
  ACCIDENT: ["Ambulance", "Police"],
  MEDICAL: ["Ambulance"],
  CRIME: ["Police"],
  RESCUE: ["NDRF", "Fire Brigade"],
  GENERAL: [],
};

const SLA_MIN: Record<string, number> = { CRITICAL: 8, HIGH: 15, MEDIUM: 30, LOW: 60 };

const OPERATORS = ["R. Kulkarni", "S. Pillai", "A. Mehta", "N. Bagul", "D. Rao"];

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Expand the templates into `count` cases.
 *
 * @param count  how many cases to build
 * @param epoch  the "now" all timestamps are measured back from. Passed in
 *               rather than read from the clock so the output is reproducible.
 */
export function buildDemoCorpus(count: number, epoch: number): CrisisCase[] {
  const r = rng(20260913);
  const cases: CrisisCase[] = [];

  // A handful of incidents get several independent callers, so clustering has
  // something real to group. Cluster members share a place and a time window.
  const clusterEvery = 37;
  let clusterId = 0;
  let clusterLeft = 0;
  let clusterPlace: { city: string; area: string; lat: number; lon: number } | null = null;
  let clusterAt = 0;

  for (let i = 0; i < count; i++) {
    const t: ReportTemplate = REPORT_TEMPLATES[Math.floor(r() * REPORT_TEMPLATES.length)];
    const region = pick(r, PLACES[t.langCode] ?? PLACES["hi-IN"]);

    const startingCluster = clusterLeft === 0 && i > 0 && i % clusterEvery === 0;
    if (startingCluster) {
      clusterId += 1;
      clusterLeft = 2 + Math.floor(r() * 3); // 3–5 reports of one incident
      clusterPlace = {
        city: region.city,
        area: pick(r, region.areas),
        lat: region.lat + (r() - 0.5) * 0.02,
        lon: region.lon + (r() - 0.5) * 0.02,
      };
      clusterAt = epoch - Math.floor(r() * 6 * 864e5);
    }

    const inCluster = clusterLeft > 0 && clusterPlace !== null;
    const area = inCluster ? clusterPlace!.area : pick(r, region.areas);
    const lat = inCluster ? clusterPlace!.lat + (r() - 0.5) * 0.004 : region.lat + (r() - 0.5) * 0.06;
    const lon = inCluster ? clusterPlace!.lon + (r() - 0.5) * 0.004 : region.lon + (r() - 0.5) * 0.06;

    // Cluster members land within 40 minutes of each other; everything else is
    // spread across the past week.
    const at = inCluster
      ? clusterAt + Math.floor(r() * 40 * 60_000)
      : epoch - Math.floor(r() * 7 * 864e5);
    const when = new Date(at);

    const severity = t.severity as CrisisCase["severity"];
    const category = t.category as CrisisCase["category"];
    const ageMin = (epoch - at) / 60_000;
    const sla = SLA_MIN[severity] ?? 30;

    // Outcomes follow from severity and age rather than being sprinkled at
    // random: an old CRITICAL case that was never dispatched is exactly what the
    // SLA sweeper exists to catch, so the corpus contains some.
    const agencies = AGENCIES[category] ?? [];
    const wasDispatched = agencies.length > 0 && r() < (severity === "CRITICAL" ? 0.88 : severity === "HIGH" ? 0.7 : 0.35);
    const dispatched = wasDispatched
      ? agencies.slice(0, 1 + (r() < 0.4 ? 1 : 0)).map((agency) => ({
          agency,
          at: new Date(at + 60_000 + r() * 5 * 60_000).toISOString(),
          taskId: `TASK-${clusterId}${i}`,
          state: (r() < 0.55 ? "complete" : r() < 0.7 ? "accepted" : "pending") as "pending" | "accepted" | "complete",
        }))
      : undefined;

    // A case that has been open for hours without a dispatch was, in reality,
    // closed out by an operator some other way — a duplicate, a false alarm, a
    // caller who rang back. Only recent misses are live breaches. Without this
    // every historical case in the corpus breached by construction, which
    // reported a 42% miss rate that says more about the generator than the
    // system.
    const staleUnworked = ageMin > 240 && !wasDispatched;
    const reviewed = staleUnworked && r() < 0.92;
    const breached = !reviewed && ageMin > sla && !wasDispatched;
    const claimed = r() < 0.45 ? pick(r, OPERATORS) : null;

    cases.push({
      id: `DEMO-${String(i + 1).padStart(4, "0")}`,
      severity,
      category,
      lang: t.lang,
      langCode: t.langCode,
      nativeText: t.native,
      englishText: t.english,
      translit: t.translit,
      location: `${area}, ${region.city}`,
      coords: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      channel: pick(r, CHANNELS),
      timestamp: when.toISOString(),
      time: hhmm(when),
      status: wasDispatched ? "DISPATCHED" : reviewed ? "CLOSED" : breached ? "SLA BREACH" : "TRIAGE",
      owner: claimed,
      claimedBy: claimed ?? undefined,
      fixNote: "",
      timeline: [],
      tags: [category, severity],
      slaMinutes: sla,
      slaEscalated: breached || undefined,
      dispatched,
      cluster: inCluster
        ? { id: `CL-${clusterId}`, size: 0, major: false } // size filled in below
        : undefined,
      // The flag the whole design rests on. Never true for corpus cases: the
      // Pipeline tab, and anything else that reports "live traffic", filters on
      // exactly this.
      isLive: false,
    });

    if (inCluster) clusterLeft -= 1;
  }

  // Cluster sizes are only knowable once every member exists.
  const sizes = new Map<string, number>();
  for (const c of cases) if (c.cluster) sizes.set(c.cluster.id, (sizes.get(c.cluster.id) ?? 0) + 1);
  for (const c of cases) {
    if (!c.cluster) continue;
    const size = sizes.get(c.cluster.id) ?? 1;
    c.cluster = { id: c.cluster.id, size, major: size >= 3 };
  }

  return cases;
}
