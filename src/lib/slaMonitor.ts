import {
  addAttention,
  appendTurn,
  listCases,
  reviseCase,
  type LiveCase,
} from "./caseStore";
import { slaMinutesFor } from "./sla";

/**
 * Watches the clock on every open case and acts when nobody else has.
 *
 * The SLA countdown previously existed only in the browser: it reached zero,
 * the number turned red, and nothing happened. A breach was a label, not an
 * event — so a case could sit unworked indefinitely as long as no operator
 * happened to be looking at that row.
 *
 * This runs server-side, on its own, whether or not anybody has the console
 * open. That is the point: the moment an SLA matters most is the moment the
 * room is too busy to notice it passing.
 *
 * IT ESCALATES, IT DOES NOT DISPATCH. A breach is a failure of OUR response,
 * not new information about the emergency, so it never touches severity or
 * category — misrepresenting an incident to reflect our own delay would
 * corrupt the one record a responder relies on. It raises the case to a human
 * and says plainly what was missed.
 */

/** Warn at three quarters elapsed — enough time left to still act on it. */
const WARN_FRACTION = 0.75;
const SWEEP_MS = 30_000;

function deadlineOf(c: LiveCase): number {
  const opened = new Date(c.timestamp).getTime();
  return opened + slaMinutesFor(c.severity) * 60_000;
}

/** A case nobody needs to chase any more. */
function isSettled(c: LiveCase): boolean {
  return Boolean(c.resolvedByOperator || c.reviewedByOperator);
}

async function escalate(c: LiveCase, overdueMin: number) {
  const dispatched = c.dispatched?.length ?? 0;

  appendTurn(c.id, {
    kind: "SYSTEM",
    text:
      `SLA BREACHED — ${overdueMin} min overdue` +
      (dispatched
        ? `, ${dispatched} agency(s) notified but nobody has closed this`
        : `, and no agency has been notified at all`),
  });
  addAttention(c.id, "SLA_BREACH");
  reviseCase(c.id, { slaEscalated: true });

  console.log(
    `[sla] ${c.id} BREACH ${c.severity}/${c.category} overdue=${overdueMin}m dispatched=${dispatched}`
  );

  // Raise it to a human in the dispatch workspace. Deliberately a supervisor
  // escalation and not an automatic dispatch: sending a unit nobody chose
  // spends a resource another scene may need, and this system has no way to
  // know it is not already on the road.
  const KEY = process.env.AMBIGUOUS_API_KEY;
  if (!KEY) return;
  try {
    await fetch(`${process.env.AMBIGUOUS_API_URL ?? "https://api.ambiguous.ai"}/api/tasks`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `⏰ SLA BREACH: ${c.id} — ${c.severity}/${c.category}`,
        description: [
          `**Case**: ${c.id}`,
          `**Severity**: ${c.severity}`,
          `**Overdue by**: ${overdueMin} minutes`,
          `**Agencies notified**: ${dispatched || "NONE"}`,
          `**Location**: ${c.location}`,
          `**Report**: ${c.englishTranslation || c.message}`,
          "",
          dispatched
            ? "Dispatched but not closed out. Confirm a unit is actually on scene."
            : "NOTHING HAS BEEN DISPATCHED. This case has been open past its SLA with no agency notified.",
        ].join("\n"),
        priority: c.severity === "CRITICAL" ? "urgent" : "high",
        status: "todo",
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    // An escalation that cannot reach the workspace still stands on the case.
    console.error(`[sla] escalation task failed for ${c.id}:`, err);
  }
}

function sweep() {
  const now = Date.now();

  for (const c of listCases()) {
    if (isSettled(c)) continue;

    const deadline = deadlineOf(c);
    const total = slaMinutesFor(c.severity) * 60_000;

    if (now >= deadline) {
      if (c.slaEscalated) continue;
      void escalate(c, Math.round((now - deadline) / 60_000));
      continue;
    }

    // Approaching, and still nobody has acted on it.
    const elapsed = now - (deadline - total);
    if (elapsed / total >= WARN_FRACTION && !c.slaWarned && !(c.dispatched?.length)) {
      reviseCase(c.id, { slaWarned: true });
      addAttention(c.id, "SLA_AT_RISK");
      appendTurn(c.id, {
        kind: "SYSTEM",
        text: `SLA at risk — ${Math.round((deadline - now) / 60_000)} min left and no agency notified`,
      });
      console.log(`[sla] ${c.id} AT RISK ${c.severity}`);
    }
  }
}

let started = false;

/**
 * Start the sweeper once, lazily.
 *
 * Lazily because Next.js evaluates modules during the build, and a timer
 * started then would run against a case store that does not exist yet.
 */
export function startSlaMonitor() {
  if (started) return;
  started = true;
  setInterval(sweep, SWEEP_MS);
  console.log(`[sla] monitor started — sweeping every ${SWEEP_MS / 1000}s`);
}
