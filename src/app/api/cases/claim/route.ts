import { NextRequest, NextResponse } from "next/server";
import { claimCase, getCase, releaseCase } from "@/lib/caseStore";

/**
 * An operator takes or releases a case.
 *
 * POST /api/cases/claim  { caseId, operator, release? }
 *
 * Ownership here is advisory and never blocks. An operator who claimed a case
 * may be on another call, away from the desk, or off shift, and an emergency
 * cannot wait on a lock — so a takeover always succeeds and is recorded on the
 * case instead of being refused.
 */
export async function POST(req: NextRequest) {
  let body: { caseId?: string; operator?: string; release?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { caseId, operator, release } = body;
  if (!caseId || !getCase(caseId)) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }
  if (!operator) {
    return NextResponse.json({ error: "operator required" }, { status: 400 });
  }

  if (release) {
    releaseCase(caseId, operator);
    return NextResponse.json({ ok: true, caseId, claimedBy: null });
  }

  const { previous } = claimCase(caseId, operator);
  if (previous && previous !== operator) {
    console.log(`[cases] ${caseId} taken over by ${operator} from ${previous}`);
  }
  return NextResponse.json({ ok: true, caseId, claimedBy: operator, takenFrom: previous });
}
