import type { CrisisCase } from "@/data/mock";

/**
 * Derives the pipeline view from the cases actually in the queue.
 *
 * The Pipeline tab used to be a picture: node states, timings and counts were
 * string literals that never changed, so it showed "done · 1.8s" on a stage
 * that had never run. Anything drawn here now has to come from a field on a
 * real case, which is why every stage is a predicate rather than a number —
 * a stage nothing has passed through reports zero and renders idle, and there
 * is no way to type in a figure that the queue does not support.
 *
 * `sponsor` names the service that stage actually calls at runtime. Stages that
 * are our own logic say so instead of borrowing a sponsor's name.
 */

export type StageId =
  | "tg" | "sms" | "call" | "web"
  | "stt" | "vision" | "triage"
  | "geo" | "cluster" | "cred"
  | "sla" | "dispatch" | "ack" | "console";

export type StageGroup = "INGEST" | "UNDERSTAND" | "ENRICH" | "ACT";

export type Stage = {
  id: StageId;
  group: StageGroup;
  label: string;
  /** The service this stage calls, or "Sankatmochan" where it is our own code. */
  sponsor: string;
  icon: string;
  /** True when this case passed through this stage. The only source of counts. */
  touched: (c: CrisisCase) => boolean;
};

/**
 * Which ingest path a case came in on.
 *
 * Channel alone cannot answer this. Both the Vobiz phone IVR and the browser
 * Realtime console write `channel: "CALL"`, which the console labels "112 CALL"
 * — so keying the graph on channel would merge two different integrations into
 * one node and report zero for the other. The case-ID prefix is assigned at
 * creation by the route that created it, so it is exact:
 *   TG-    telegram/webhook        SMS-   sms/webhook
 *   CALL-  vobiz (callSession)     RT-/DRILL-  realtime/case
 */
const from = (c: CrisisCase, ...prefixes: string[]) =>
  prefixes.some((p) => c.id.startsWith(p));

const isTelegram = (c: CrisisCase) =>
  from(c, "TG-") || c.channel === "TELEGRAM" || c.channel === "TG VOICE" || c.channel === "TG PHOTO";

/** Audio that is transcribed before triage sees any text. */
const isSpoken = (c: CrisisCase) =>
  c.channel === "TG VOICE" || c.channel === "112 CALL" || c.channel === "VOICE";

export const STAGES: Stage[] = [
  // ── Triggers. One per real ingest route; there is no fifth. ───────────────
  { id: "tg",   group: "INGEST", label: "Telegram",      sponsor: "Telegram Bot API",      icon: "send",           touched: isTelegram },
  { id: "sms",  group: "INGEST", label: "SMS",           sponsor: "SMS Gateway · Android", icon: "message",        touched: (c) => from(c, "SMS-") || c.channel === "SMS" },
  { id: "call", group: "INGEST", label: "112 Call",      sponsor: "Vobiz IVR",             icon: "phone-incoming", touched: (c) => from(c, "CALL-") },
  { id: "web",  group: "INGEST", label: "Browser Voice", sponsor: "OpenAI Realtime",       icon: "radio",          touched: (c) => from(c, "RT-", "DRILL-") },

  // ── Understanding. ───────────────────────────────────────────────────────
  // Keyed on channel rather than on transcript text, because the transcript and
  // image analysis live on the ingest type and are not carried onto the case
  // the console sees. Channel is exact here: a spoken channel is transcribed
  // before triage gets any text, and a photo channel is what invokes vision.
  { id: "stt",    group: "UNDERSTAND", label: "Speech → Text",  sponsor: "OpenAI gpt-4o-transcribe", icon: "mic",       touched: isSpoken },
  { id: "vision", group: "UNDERSTAND", label: "Scene Analysis", sponsor: "OpenAI gpt-4o vision",     icon: "eye",       touched: (c) => c.channel === "TG PHOTO" },
  { id: "triage", group: "UNDERSTAND", label: "Detect · Translate · Triage", sponsor: "OpenAI gpt-4o-mini", icon: "languages", touched: () => true },

  // ── Enrichment. ──────────────────────────────────────────────────────────
  { id: "geo",     group: "ENRICH", label: "Geocode",     sponsor: "Nominatim · OSM",  icon: "map-pin",      touched: (c) => Boolean(c.coords) && c.coords !== "—" },
  { id: "cluster", group: "ENRICH", label: "Clustering",  sponsor: "Sankatmochan",     icon: "git-merge",    touched: (c) => Boolean(c.cluster) },
  { id: "cred",    group: "ENRICH", label: "Credibility", sponsor: "Sankatmochan",     icon: "shield",       touched: (c) => Boolean(c.credibility) },

  // ── Action. ──────────────────────────────────────────────────────────────
  { id: "sla",      group: "ACT", label: "Queue · SLA Clock", sponsor: "Sankatmochan",  icon: "timer",        touched: () => true },
  { id: "console",  group: "ACT", label: "Operator Console",  sponsor: "CopilotKit",    icon: "layout",       touched: (c) => Boolean(c.claimedBy) || Boolean(c.notes?.length) },
  { id: "dispatch", group: "ACT", label: "Dispatch",          sponsor: "Ambiguous AI",  icon: "siren",        touched: (c) => Boolean(c.dispatched?.length) },
  { id: "ack",      group: "ACT", label: "Acknowledged",      sponsor: "Ambiguous AI",  icon: "check",        touched: (c) => Boolean(c.dispatched?.some((d) => d.state === "accepted" || d.state === "complete")) },
];

export type StageStat = {
  stage: Stage;
  /** How many cases in the queue passed this stage. */
  count: number;
  /** Newest case timestamp at this stage, epoch ms, or null when nothing has. */
  lastAt: number | null;
  /** True when the newest case in the queue went through here. */
  onLatestPath: boolean;
};

/**
 * Case time as epoch ms, or 0 when there isn't a real one.
 *
 * Seeded demo cases carry a wall-clock string ("02:14") rather than a date.
 * `new Date("02:14")` does not reject it — depending on the engine it yields a
 * date in year 2001 — which rendered as "497023h ago" on the canvas. Anything
 * that is not a full parseable date is treated as no timestamp at all, so the
 * stage reads "idle" instead of inventing an age.
 */
function ts(c: CrisisCase): number {
  if (!c.timestamp || !/\d{4}/.test(c.timestamp)) return 0;
  const t = new Date(c.timestamp).getTime();
  return Number.isFinite(t) ? t : 0;
}

/**
 * Stage statistics over a set of cases.
 *
 * Pass only the cases you want represented — the console passes live ones, so
 * the graph reflects traffic this deployment actually handled rather than the
 * seeded demo rows.
 */
export function pipelineStats(cases: CrisisCase[]): StageStat[] {
  const latest = cases.reduce<CrisisCase | null>(
    (best, c) => (best === null || ts(c) > ts(best) ? c : best),
    null
  );

  return STAGES.map((stage) => {
    const hit = cases.filter((c) => stage.touched(c));
    const lastAt = hit.reduce<number | null>((max, c) => {
      const t = ts(c);
      if (t === 0) return max; // no real timestamp — cannot date this stage
      return max === null || t > max ? t : max;
    }, null);
    return {
      stage,
      count: hit.length,
      lastAt,
      onLatestPath: latest !== null && stage.touched(latest),
    };
  });
}

/** Edges of the flow graph. Kept here so the canvas cannot invent its own. */
export const FLOW: [StageId, StageId][] = [
  ["tg", "stt"], ["tg", "vision"], ["tg", "triage"],
  ["sms", "triage"],
  ["call", "stt"],
  ["web", "stt"],
  ["stt", "triage"], ["vision", "triage"],
  ["triage", "geo"], ["triage", "cluster"], ["triage", "cred"],
  ["geo", "sla"], ["cluster", "sla"], ["cred", "sla"],
  ["sla", "console"], ["sla", "dispatch"],
  ["console", "dispatch"],
  ["dispatch", "ack"],
];

/** Relative time for a stage's last activity. Null renders as "idle". */
export function agoLabel(at: number | null, now: number): string {
  if (at === null) return "idle";
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}
