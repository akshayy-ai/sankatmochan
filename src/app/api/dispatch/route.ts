/**
 * /api/dispatch — Ambiguous AI dispatch endpoint.
 *
 * When the CopilotKit agent confirms an escalation, this route:
 * 1. Creates a Task in the Ambiguous workspace (dispatch record)
 * 2. Sends an email notification to the target agency
 * 3. Logs the action in a Doc (incident log)
 *
 * All operations go through the Ambiguous REST API using the
 * provisioned "Sankatmochan Dispatch" agent identity.
 */
import { NextRequest, NextResponse } from "next/server";
import { getCase, recordDispatch, reviseCase, appendTurn } from "@/lib/caseStore";

const API = process.env.AMBIGUOUS_API_URL ?? "https://api.ambiguous.ai";
const KEY = process.env.AMBIGUOUS_API_KEY ?? "";

async function ambi(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      "API-Version": "1",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ambiguous ${path} ${res.status}: ${text}`);
  }
  return res.json();
}

async function ambiGet(path: string) {
  const res = await fetch(`${API}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "API-Version": "1",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ambiguous GET ${path} ${res.status}: ${text}`);
  }
  return res.json();
}

// Agency email mapping (demo — in production these come from a config)
const AGENCY_CONTACTS: Record<string, { name: string; email: string }> = {
  NDRF: { name: "NDRF Control Room", email: "ndrf-ops@demo.sankatmochan.in" },
  SDRF: { name: "SDRF State HQ", email: "sdrf-state@demo.sankatmochan.in" },
  HOSPITAL: { name: "Trauma Centre", email: "trauma@demo.sankatmochan.in" },
  FIRE: { name: "Fire Brigade", email: "fire-control@demo.sankatmochan.in" },
  POLICE: { name: "Police Control", email: "police-pcr@demo.sankatmochan.in" },
};

export async function POST(req: NextRequest) {
  try {
    const {
      caseId,
      agency,
      reason,
      priority,
      caseDetails,
      severity,
      location,
      language,
      nearestFacility,
    } = await req.json();

    if (!KEY) {
      return NextResponse.json(
        { error: "AMBIGUOUS_API_KEY not configured" },
        { status: 500 },
      );
    }

    const contact = AGENCY_CONTACTS[agency] ?? {
      name: agency,
      email: `${agency.toLowerCase()}@demo.sankatmochan.in`,
    };

    // 1. Create a dispatch task in the Ambiguous workspace
    // Guard before creating, not after. The idempotency check used to run on
    // the response, so a double-click produced two workspace tasks and two
    // agencies believing they owned the same scene.
    if (caseId) {
      const existing = getCase(caseId)?.dispatched?.find((d) => d.agency === agency);
      if (existing) {
        return NextResponse.json({
          status: "ALREADY_DISPATCHED",
          taskId: existing.taskId,
          agency,
          message: `${agency} was already notified at ${existing.at}.`,
        });
      }
    }

    const task = await ambi("/api/tasks", {
      title: `🚨 ${priority} DISPATCH: ${caseId} → ${agency}`,
      description: [
        `**Case**: ${caseId}`,
        `**Severity**: ${severity}`,
        `**Agency**: ${agency} (${contact.name})`,
        `**Location**: ${location ?? "See case details"}`,
        ...(nearestFacility ? [`**Nearest unit**: ${nearestFacility}`] : []),
        `**Language**: ${language ?? "Unknown"}`,
        `**Reason**: ${reason}`,
        `**Details**: ${caseDetails}`,
        "",
        `Priority: ${priority}`,
        `Created: ${new Date().toISOString()}`,
      ].join("\n"),
      // Severity arrives as P1-P4 from dispatchRouting.priorityFor().
      priority:
        priority === "P1" ? "urgent" :
        priority === "P2" ? "high" :
        priority === "P4" ? "low" : "medium",
      status: "todo",
      // The API rejects unrecognised keys outright ("Unrecognized key: labels"),
      // so tags live in the description rather than a field it does not accept.
    });

    // 2. Send dispatch notification email via Ambiguous Mail
    let emailResult = null;
    try {
      emailResult = await ambi("/api/mail/send", {
        to: contact.email,
        subject: `🚨 [${priority}] Emergency Dispatch: ${caseId} — ${agency}`,
        body_markdown: [
          `# Emergency Dispatch Notification`,
          "",
          `| Field | Value |`,
          `|-------|-------|`,
          `| **Case ID** | ${caseId} |`,
          `| **Severity** | ${severity} |`,
          `| **Priority** | ${priority} |`,
          `| **Location** | ${location ?? "See case details"} |`,
          `| **Language** | ${language ?? "Unknown"} |`,
          "",
          `## Reason for Escalation`,
          reason,
          "",
          `## Case Details`,
          caseDetails,
          "",
          `---`,
          `*Dispatched by Sankatmochan 112 Response Grid*`,
          `*${new Date().toISOString()}*`,
        ].join("\n"),
      });
    } catch (mailErr) {
      // Email is best-effort; task creation is the critical path
      console.warn("[dispatch] Mail send failed:", mailErr);
    }

    // Recorded on the case, not just returned to the browser: an operator who
    // reloads, or a second one opening the same incident, has to see what has
    // already gone out or the same unit gets sent twice.
    const taskId = task.id ?? task.task?.id;
    if (caseId) recordDispatch(caseId, agency, taskId);

    return NextResponse.json({
      status: "DISPATCHED",
      taskId,
      taskTitle: task.title ?? task.task?.title,
      agency,
      contact: contact.name,
      emailSent: !!emailResult,
      message: `Dispatch to ${agency} created. Task ${task.id ?? task.task?.id} tracked in Ambiguous workspace.`,
    });
  } catch (err) {
    console.error("[dispatch] Error:", err);
    return NextResponse.json(
      { error: String(err), status: "FAILED" },
      { status: 500 },
    );
  }
}

// GET — list recent dispatch tasks
export async function GET() {
  try {
    if (!KEY) {
      return NextResponse.json(
        { error: "AMBIGUOUS_API_KEY not configured" },
        { status: 500 },
      );
    }
    const tasks = await ambiGet("/api/tasks?status=todo&limit=20");
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("[dispatch] GET Error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 },
    );
  }
}
