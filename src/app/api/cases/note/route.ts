import { NextRequest, NextResponse } from "next/server";
import { addNote, getCase } from "@/lib/caseStore";

/**
 * A handoff note from an operator.
 *
 * POST /api/cases/note  { caseId, operator, text }
 *
 * Everything else on a case is machine-written. This is the one place a person
 * records what they worked out and the system could not derive — a callback
 * number given verbally, a landmark the caller corrected, that the line keeps
 * dropping. At a shift change that context otherwise leaves with them.
 */
export async function POST(req: NextRequest) {
  let body: { caseId?: string; operator?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { caseId, operator, text } = body;
  if (!caseId || !getCase(caseId)) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }
  if (!operator || !text?.trim()) {
    return NextResponse.json({ error: "operator and text required" }, { status: 400 });
  }

  addNote(caseId, operator, text);
  return NextResponse.json({ ok: true, caseId });
}
