import { NextRequest, NextResponse } from "next/server";
import {
  addCase,
  addAttention,
  appendTurn,
  getCase,
  nextCaseId,
  raiseSeverity,
  reviseCase,
  touchCase,
} from "@/lib/caseStore";

/**
 * Case writes from the Realtime voice console.
 *
 * The client used to invent `CASE-${Math.random()}` and return it to the model
 * as if a case had been filed. Nothing reached the store, so a successful
 * triage of a life-threatening emergency was invisible to every operator and
 * the caller was told a reference number that existed nowhere.
 *
 * DRILL FRAMING: this panel listens on the operator's own microphone, not a
 * telephony bridge, so every case it opens is marked `drill` unless
 * REALTIME_LIVE=1. Mixing browser-mic rehearsals into the same queue as real
 * traffic, under a label one character away from "112 CALL", would be a worse
 * operator outcome than the duplicates this work set out to remove.
 */

const IS_LIVE = process.env.REALTIME_LIVE === "1";

/**
 * Only these may be written by a model-supplied patch. A tool argument must
 * never be able to set `id` (rewriting the number the caller was given) or a
 * status field (marking a live CRITICAL case terminal, and so evictable).
 */
const WRITABLE = new Set([
  "severity",
  "category",
  "location",
  "language",
  "englishTranslation",
  "senderName",
  "message",
]);

type Body = {
  action?: "create" | "update" | "turn";
  sessionId?: string;
  caseId?: string;
  patch?: Record<string, unknown>;
  turn?: { role?: string; text?: string };
};

/** Sessions map to cases so a reconnect resumes rather than duplicating. */
const sessionCase = new Map<string, string>();

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const action = body.action || "create";

  // ── Append a spoken turn ──────────────────────────────────────────────
  if (action === "turn") {
    const caseId = body.caseId || (body.sessionId ? sessionCase.get(body.sessionId) : undefined);
    if (!caseId || !getCase(caseId)) {
      return NextResponse.json({ error: "no case for session" }, { status: 404 });
    }
    const text = (body.turn?.text || "").trim();
    appendTurn(caseId, {
      kind: body.turn?.role === "caller" ? "CALLER" : "AGENT",
      // An empty or garbled transcription is still evidence that speech
      // happened. An operator scrubbing the case must see we failed to
      // capture it rather than see nothing at all.
      text: text || "[speech not captured]",
    });
    touchCase(caseId);
    return NextResponse.json({ ok: true, caseId });
  }

  // ── Resume an existing session's case ─────────────────────────────────
  if (body.sessionId && sessionCase.has(body.sessionId)) {
    const caseId = sessionCase.get(body.sessionId)!;
    if (getCase(caseId)) {
      if (body.patch) applyPatch(caseId, body.patch);
      touchCase(caseId);
      return NextResponse.json({ ok: true, caseId, resumed: true });
    }
  }

  // ── Update a named case ───────────────────────────────────────────────
  if (action === "update" && body.caseId && getCase(body.caseId)) {
    applyPatch(body.caseId, body.patch || {});
    touchCase(body.caseId);
    return NextResponse.json({ ok: true, caseId: body.caseId });
  }

  // ── Create ────────────────────────────────────────────────────────────
  const p = body.patch || {};
  const caseId = nextCaseId(IS_LIVE ? "RT" : "DRILL");

  addCase({
    id: caseId,
    chatId: 0,
    senderName: String(p.senderName || "Voice console caller"),
    message: String(p.message || "[voice console session]"),
    language: String(p.language || "Unknown"),
    englishTranslation: String(p.englishTranslation || ""),
    severity: String(p.severity || "MEDIUM"),
    category: String(p.category || "GENERAL"),
    timestamp: new Date().toISOString(),
    location: String(p.location || "Location not shared"),
    channel: "CALL",
    turns: [],
    slots: {},
    attention: IS_LIVE ? [] : ["DRILL"],
  });

  if (body.sessionId) sessionCase.set(body.sessionId, caseId);
  appendTurn(caseId, {
    kind: "SYSTEM",
    text: IS_LIVE ? "Voice console session opened" : "Voice console DRILL opened",
  });

  console.log(`[realtime] ${caseId} opened (${IS_LIVE ? "live" : "drill"})`);
  return NextResponse.json({ ok: true, caseId, drill: !IS_LIVE });
}

function applyPatch(caseId: string, patch: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (!WRITABLE.has(k)) {
      appendTurn(caseId, { kind: "SYSTEM", text: `Rejected unknown field from model: ${k}` });
      continue;
    }
    if (v === undefined || v === null || v === "") continue;
    if (k === "severity") { raiseSeverity(caseId, String(v)); continue; }
    clean[k] = v;
  }
  if (Object.keys(clean).length) reviseCase(caseId, clean);
  addAttention(caseId, "OPERATOR_REQUESTED");
}

export async function GET() {
  return NextResponse.json({ ok: true, mode: IS_LIVE ? "live" : "drill" });
}
