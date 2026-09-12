import { NextRequest, NextResponse } from "next/server";
import { appendTurn, getCase, resolveCase } from "@/lib/caseStore";

/**
 * Operator closes an incident.
 *
 * POST /api/cases/resolve  { "caseId": "TG-..." }
 *
 * The case stays visible in the queue — what ends is its claim on being the
 * default destination for that chat's next message. This is deliberately the
 * only way an incident closes: a caller cannot retire their own case, because
 * a frightened or coerced one may be made to say everything is fine.
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
  resolveCase(caseId);
  appendTurn(caseId, { kind: "SYSTEM", text: "Closed by operator" });
  console.log(`[cases] ${caseId} resolved by operator`);
  return NextResponse.json({ ok: true, caseId });
}
