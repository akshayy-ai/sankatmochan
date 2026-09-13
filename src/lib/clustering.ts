import type { LiveCase } from "./caseStore";

/**
 * Call-storm clustering.
 *
 * When a building burns, twenty people ring 112 about it. Each is a genuine
 * report, and each currently becomes its own case — so the queue floods with
 * rows an operator has to reconcile by hand at the exact moment they have no
 * time to. Clustering groups them into one incident carrying twenty
 * corroborating reports, which is also better signal: twenty independent
 * reports of the same fire is strong evidence it is real and large.
 *
 * LINK, NEVER ABSORB. Unlike follow-ups in one chat — same person, so merging
 * is safe — this groups DIFFERENT people. A wrong merge would hide somebody
 * else's emergency, so no case is ever destroyed or rewritten: each keeps its
 * own id, its own reporter and its own contact details, and the cluster is a
 * view over them that an operator can break.
 */

/** How far apart two reports can be and still be the same incident. */
const RADIUS_M: Record<string, number> = {
  // Floods are area-wide; two reports a kilometre apart are usually one event.
  FLOOD: 1200,
  // A fire is visible from a distance, so reports cluster loosely around it.
  FIRE: 500,
  // A crash is a point. Tight, or two collisions on one road become one case.
  ACCIDENT: 250,
  DEFAULT: 400,
};

/** Reports further apart in time than this are separate events. */
const WINDOW_MS = 45 * 60 * 1000;

/** At this many reports an incident is no longer routine. */
export const MAJOR_INCIDENT_THRESHOLD = 3;

function parseCoords(s: string): [number, number] | null {
  const m = s.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!m) return null;
  return [parseFloat(m[1]), parseFloat(m[2])];
}

function metresBetween(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b[0] - a[0]);
  const dLon = r(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Strip punctuation and case so "Kothrud, Suyog Apt." matches "kothrud suyog apt". */
function normalisePlace(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Do two place names describe the same spot?
 *
 * Requires two shared words of real length, not one — "Pune" alone is shared
 * by half the city, and a single token match would merge unrelated incidents
 * across the whole district.
 */
function placesMatch(a: string, b: string): boolean {
  const A = new Set(normalisePlace(a).split(" ").filter((w) => w.length > 3));
  const B = new Set(normalisePlace(b).split(" ").filter((w) => w.length > 3));
  if (A.size === 0 || B.size === 0) return false;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared >= 2;
}

const NO_LOCATION = /^location not shared$/i;

/**
 * Would these two reports be the same incident?
 *
 * Category must match exactly. A fire and a medical emergency at one address
 * are two incidents needing two different agencies, and merging them would
 * send one unit to a scene that needed both.
 */
export function sameIncident(a: LiveCase, b: LiveCase): boolean {
  if (a.id === b.id) return false;
  if (a.category !== b.category) return false;

  // Reports from the same sender are a conversation, handled elsewhere.
  if (a.chatId !== 0 && a.chatId === b.chatId) return false;

  const ta = new Date(a.timestamp).getTime();
  const tb = new Date(b.timestamp).getTime();
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return false;
  if (Math.abs(ta - tb) > WINDOW_MS) return false;

  const ca = parseCoords(a.location);
  const cb = parseCoords(b.location);

  // Both pinned — the precise case.
  if (ca && cb) {
    const limit = RADIUS_M[a.category] ?? RADIUS_M.DEFAULT;
    return metresBetween(ca, cb) <= limit;
  }

  // Neither pinned — fall back to the place names the model extracted. Weaker,
  // so it demands two matching words rather than one.
  if (!ca && !cb) {
    if (NO_LOCATION.test(a.location) || NO_LOCATION.test(b.location)) return false;
    return placesMatch(a.location, b.location);
  }

  // One pinned, one not: no reliable way to compare. Left unclustered rather
  // than guessed — an operator seeing two rows is a smaller cost than a real
  // emergency hidden inside someone else's incident.
  return false;
}

export type Cluster = {
  id: string;
  caseIds: string[];
  category: string;
  /** Highest severity across the member reports. */
  severity: string;
  /** True once enough independent reports corroborate it. */
  major: boolean;
};

const RANK: Record<string, number> = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

/**
 * Group cases into incidents.
 *
 * Transitive by design: if A matches B and B matches C, all three are one
 * incident even when A and C are at opposite edges of the radius — which is
 * how a fire reported from both ends of a street actually looks.
 */
export function clusterCases(cases: LiveCase[]): Cluster[] {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)!)!);
      x = parent.get(x)!;
    }
    return x;
  };
  const union = (x: string, y: string) => {
    const rx = find(x), ry = find(y);
    if (rx !== ry) parent.set(rx, ry);
  };

  for (const c of cases) parent.set(c.id, c.id);
  for (let i = 0; i < cases.length; i++) {
    for (let j = i + 1; j < cases.length; j++) {
      if (sameIncident(cases[i], cases[j])) union(cases[i].id, cases[j].id);
    }
  }

  const groups = new Map<string, LiveCase[]>();
  for (const c of cases) {
    const root = find(c.id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(c);
  }

  return [...groups.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([root, members]) => ({
      id: root,
      caseIds: members.map((m) => m.id),
      category: members[0].category,
      // High-water mark, as everywhere else: one caller reporting children
      // trapped sets the incident's severity even if nine others sound calm.
      severity: members.reduce(
        (worst, m) => ((RANK[m.severity] ?? 0) > (RANK[worst] ?? 0) ? m.severity : worst),
        "LOW"
      ),
      major: members.length >= MAJOR_INCIDENT_THRESHOLD,
    }));
}
