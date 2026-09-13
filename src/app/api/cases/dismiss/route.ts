import { NextRequest, NextResponse } from "next/server";
import { dismissFlags, getCase } from "@/lib/caseStore";

/**
 * Operator clears the review flags on a case.
 *
 * POST /api/cases/dismiss  { "caseId": "TG-..." }
 *
 * The case stays in the queue and stays readable — this records that a human
 * looked and judged it not an emergency, which is different from resolving a
 * real incident and different again from deleting it.
 */
export async function POST(req: NextRequest) {
  let caseId: string | undefined;
  try {
    caseId = (await req.json())?.caseId;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!caseId || !getCase(caseId)) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }
  dismissFlags(caseId);
  console.log(`[cases] ${caseId} flags cleared by operator`);
  return NextResponse.json({ ok: true, caseId });
}
