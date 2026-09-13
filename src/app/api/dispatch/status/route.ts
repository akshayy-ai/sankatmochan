import { NextRequest, NextResponse } from "next/server";
import { appendTurn, getCase, listCases, reviseCase } from "@/lib/caseStore";

/**
 * Dispatch acknowledgement — closing the loop.
 *
 * Creating a task told us a request was sent. It never told us whether anyone
 * picked it up, which is the question an operator actually has: a request
 * nobody opened is indistinguishable, on our side, from a unit already on the
 * road. That gap is where a scene waits.
 *
 * This reads task state back from the Ambiguous workspace and mirrors it onto
 * the case, so UNACKNOWLEDGED is visible as its own alarming state rather than
 * looking the same as dispatched.
 *
 * GET /api/dispatch/status            — refresh every case with open dispatches
 * GET /api/dispatch/status?caseId=... — one case
 */

const KEY = process.env.AMBIGUOUS_API_KEY;
const API = process.env.AMBIGUOUS_API_URL ?? "https://api.ambiguous.ai";

/** A task nobody has opened in this long is escalated to the operator. */
const UNACKNOWLEDGED_MS = 4 * 60 * 1000;

type AmbiTask = { id?: string; status?: string; title?: string };

async function fetchTasks(): Promise<AmbiTask[]> {
  if (!KEY) return [];
  const res = await fetch(`${API}/api/tasks?limit=100`, {
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(9000),
  });
  if (!res.ok) throw new Error(`Ambiguous ${res.status}`);
  const body = await res.json();
  return body?.data ?? body?.tasks ?? [];
}

/** Workspace statuses mapped to what an operator needs to know. */
function toDispatchState(status?: string): "pending" | "accepted" | "complete" {
  const s = (status || "").toLowerCase();
  if (["done", "completed", "closed", "resolved"].includes(s)) return "complete";
  if (["in_progress", "in-progress", "doing", "active", "acknowledged"].includes(s)) return "accepted";
  return "pending";
}

export async function GET(req: NextRequest) {
  const only = req.nextUrl.searchParams.get("caseId");

  let tasks: AmbiTask[];
  try {
    tasks = await fetchTasks();
  } catch (err) {
    // The console must keep working when the workspace does not.
    console.error("[dispatch/status] fetch failed:", err);
    return NextResponse.json({ ok: false, error: String(err), updated: 0 });
  }

  const byId = new Map(tasks.filter((t) => t.id).map((t) => [t.id!, t]));
  const cases = only ? [getCase(only)].filter(Boolean) : listCases();
  let updated = 0;

  for (const c of cases) {
    if (!c?.dispatched?.length) continue;
    let changed = false;

    for (const d of c.dispatched) {
      const task = d.taskId ? byId.get(d.taskId) : undefined;
      const next = task ? toDispatchState(task.status) : d.state;

      if (next && next !== d.state) {
        d.state = next;
        changed = true;
        appendTurn(c.id, {
          kind: "SYSTEM",
          text:
            next === "accepted"
              ? `${d.agency} acknowledged the dispatch`
              : next === "complete"
              ? `${d.agency} marked the dispatch complete`
              : `${d.agency} dispatch is still unopened`,
        });
      }

      // Nobody has opened it. Say so loudly — an unacknowledged request looks
      // exactly like a handled one unless something surfaces the difference.
      const age = Date.now() - new Date(d.at).getTime();
      if ((d.state ?? "pending") === "pending" && age > UNACKNOWLEDGED_MS && !d.escalated) {
        d.escalated = true;
        changed = true;
        appendTurn(c.id, {
          kind: "SYSTEM",
          text: `${d.agency} has not acknowledged after ${Math.round(age / 60000)} minutes — escalate`,
        });
      }
    }

    if (changed) {
      reviseCase(c.id, { dispatched: c.dispatched });
      updated++;
    }
  }

  return NextResponse.json({ ok: true, updated, tasksSeen: tasks.length });
}
