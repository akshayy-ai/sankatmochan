import { randomUUID } from "node:crypto";
import { addCase, appendTurn, getCase, nextCaseId, raiseSeverity } from "./caseStore";

/**
 * Per-call state for the Vobiz phone channel.
 *
 * A 112 call is a conversation, not a single utterance. The session tracks
 * which facts have been gathered, which questions have been asked, and how
 * long the caller has been silent, so the line can be held open and the right
 * next question asked.
 *
 * Two rules shape everything here:
 *  - The case exists from the moment the call connects. Nothing about the
 *    caller's record depends on the call ending gracefully.
 *  - Silence is never read as consent to hang up. Someone trapped, injured or
 *    hiding goes quiet; those are the calls that matter most.
 */

export type Slot =
  | "where"
  | "what"
  | "people"
  | "trapped"
  | "injured"
  | "ongoing"
  | "safe_to_speak";

export type CallSession = {
  uuid: string;
  caseId: string;
  from: string;
  language: string;
  langTag: string;
  turns: number;
  consecutiveSilent: number;
  /** How many times each slot has been asked — a garbled answer may be re-asked. */
  asked: Partial<Record<Slot, number>>;
  /** Slots actually filled. */
  answered: Slot[];
  /** Whether the caller has ever produced speech or a keypress on this call. */
  everSpoke: boolean;
  lastQuestion: string;
  lastSeenAt: number;
  phase: "open" | "ended";
};

const SESSION_TTL_MS = 30 * 60 * 1000;
/** Comfortably longer than the longest Gather timeout, so a held line is not reaped. */
export const STALL_MS = 5 * 60 * 1000;

const calls = new Map<string, CallSession>();

function sweep() {
  const now = Date.now();
  for (const [k, s] of calls) {
    if (now - s.lastSeenAt > SESSION_TTL_MS) calls.delete(k);
  }
}

/** Open a call and file its case immediately, before the caller says anything. */
export function openCall(uuid: string, from: string): CallSession {
  sweep();
  const existing = calls.get(uuid);
  if (existing) return existing;

  const caseId = nextCaseId("CALL");
  addCase({
    id: caseId,
    chatId: 0,
    senderName: from,
    message: "[call connected]",
    // Language is unknown until the caller speaks. Claiming Hindi here makes a
    // Tamil caller's first turn get transcribed by the wrong recogniser.
    language: "Unknown",
    englishTranslation: "Call connected — caller has not spoken yet.",
    severity: "MEDIUM",
    category: "GENERAL",
    timestamp: new Date().toISOString(),
    location: "Location not shared",
    channel: "CALL",
    callUuid: uuid,
    callerNumber: from,
    turns: [],
    slots: {},
    attention: [],
  });
  appendTurn(caseId, { kind: "SYSTEM", text: `Call connected from ${from}` });

  const s: CallSession = {
    uuid,
    caseId,
    from,
    language: "Unknown",
    langTag: process.env.VOBIZ_GATHER_LANGUAGE || "hi-IN",
    turns: 0,
    consecutiveSilent: 0,
    asked: {},
    answered: [],
    everSpoke: false,
    lastQuestion: "",
    lastSeenAt: Date.now(),
    phase: "open",
  };
  calls.set(uuid, s);
  return s;
}

export function getCall(uuid: string): CallSession | undefined {
  if (!uuid) return undefined;
  const s = calls.get(uuid);
  if (s) s.lastSeenAt = Date.now();
  return s;
}

/**
 * Recover a session from the case id carried in the callback URL, for when
 * Vobiz omits or changes CallUUID between legs. A finalized session is
 * reopened rather than replaced — minting a new case would duplicate the
 * caller in the operator's queue.
 */
export function resumeCall(caseId: string | null, uuid: string, from: string): CallSession | undefined {
  if (!caseId) return undefined;
  for (const s of calls.values()) {
    if (s.caseId !== caseId) continue;
    s.phase = "open";
    s.lastSeenAt = Date.now();
    if (uuid && s.uuid !== uuid) {
      calls.delete(s.uuid);
      s.uuid = uuid;
      calls.set(uuid, s);
    }
    return s;
  }
  // Case exists but its session was swept — rebuild around the same case so
  // the caller keeps their reference number.
  const c = getCase(caseId);
  if (!c) return undefined;
  const s: CallSession = {
    uuid: uuid || `synthetic-${randomUUID()}`,
    caseId,
    from: from || c.callerNumber || "Unknown",
    language: c.language,
    langTag: "hi-IN",
    turns: (c.turns || []).filter((t) => t.kind === "CALLER").length,
    consecutiveSilent: 0,
    asked: {},
    answered: [],
    everSpoke: (c.turns || []).some((t) => t.kind === "CALLER" && !!t.text),
    lastQuestion: "",
    lastSeenAt: Date.now(),
    phase: "open",
  };
  calls.set(s.uuid, s);
  return s;
}

export function endCall(uuid: string, reason: string) {
  const s = calls.get(uuid);
  if (!s) return;
  s.phase = "ended";
  s.lastSeenAt = Date.now();
  appendTurn(s.caseId, { kind: "SYSTEM", text: `Call ended (${reason})` });
}

// ── Deterministic question ladder ───────────────────────────────────────────
// The model never chooses the next question. It runs detached, after the XML
// is already on the wire, so no model latency is ever dead air on the line.

const LADDER: Record<string, Slot[]> = {
  FIRE: ["where", "trapped", "ongoing", "people"],
  MEDICAL: ["where", "injured", "people"],
  ACCIDENT: ["where", "injured", "ongoing"],
  FLOOD: ["where", "trapped", "people"],
  DV: ["where", "ongoing", "safe_to_speak"],
  SAFETY: ["where", "ongoing", "people"],
  MISSING: ["where", "what", "people"],
  GENERAL: ["where", "what", "people"],
};

/**
 * Questions ask about the INCIDENT's location, not the caller's. A son in
 * Delhi reporting his mother's collapse in Pune must not have his own
 * position recorded as the scene.
 */
const ASK: Record<Slot, string> = {
  where: "घटना कहाँ हुई है? इमारत का नाम या पास की कोई पहचान बताइए।",
  what: "क्या हुआ है? थोड़ा और बताइए।",
  people: "वहाँ कितने लोग हैं?",
  trapped: "क्या कोई अंदर फंसा हुआ है?",
  injured: "क्या किसी को चोट लगी है?",
  ongoing: "क्या यह अभी भी हो रहा है?",
  safe_to_speak: "क्या आप सुरक्षित जगह पर हैं?",
};

/** `where` may be re-asked — dispatch cannot function without it. */
export function nextSlot(s: CallSession, category: string): Slot | null {
  if (!s.answered.includes("where") && (s.asked.where ?? 0) < 3) return "where";
  const ladder = LADDER[category] ?? LADDER.GENERAL;
  return ladder.find((k) => !s.answered.includes(k) && (s.asked[k] ?? 0) < 2) ?? null;
}

export function questionFor(slot: Slot): string {
  return ASK[slot];
}

export function markAsked(s: CallSession, slot: Slot) {
  s.asked[slot] = (s.asked[slot] ?? 0) + 1;
  s.lastQuestion = ASK[slot];
}

// ── Keyword severity floor ──────────────────────────────────────────────────
// The only thing standing between an OpenAI outage and a queue of
// indistinguishable MEDIUM/GENERAL rows during a mass-casualty event.

const FLOOR: [RegExp, string, string][] = [
  [/फंस|फसल|अंदर\s*है|trapped|stuck inside/i, "FIRE", "CRITICAL"],
  [/साँस|सांस|बेहोश|खून|दिल का दौरा|cardiac|not breathing|unconscious/i, "MEDICAL", "CRITICAL"],
  [/आग|आगीच|जल\s*रह|fire|burning|धुआं|smoke/i, "FIRE", "HIGH"],
  [/बाढ़|पानी भर|डूब|flood|drowning/i, "FLOOD", "HIGH"],
  [/दुर्घटना|टक्कर|accident|crash|collision/i, "ACCIDENT", "HIGH"],
  [/मार|पीट|धमकी|violence|beating|attack/i, "SAFETY", "HIGH"],
  [/गुम|लापता|missing|खो गया/i, "MISSING", "HIGH"],
];

/** Raise, never lower. Applied even when the model is unavailable. */
export function applyKeywordFloor(caseId: string, text: string): { category?: string; severity?: string } {
  for (const [re, category, severity] of FLOOR) {
    if (re.test(text)) {
      const raised = raiseSeverity(caseId, severity);
      return raised ? { category, severity } : { category };
    }
  }
  return {};
}

export function recordSilence(s: CallSession) {
  s.consecutiveSilent += 1;
  appendTurn(s.caseId, {
    kind: "SYSTEM",
    text: `No response from caller (silence ${s.consecutiveSilent})`,
  });
  // Going quiet mid-report is deterioration, not disinterest.
  if (s.everSpoke && s.consecutiveSilent >= 3) raiseSeverity(s.caseId, "HIGH");
}

export function recordSpeech(s: CallSession, text: string, confidence: number) {
  s.everSpoke = true;
  s.consecutiveSilent = 0;
  s.turns += 1;
  appendTurn(s.caseId, { kind: "CALLER", text, confidence });
}

export function activeCallCount(): number {
  sweep();
  return [...calls.values()].filter((s) => s.phase === "open").length;
}
