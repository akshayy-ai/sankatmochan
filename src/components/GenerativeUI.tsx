"use client";

/**
 * Generative UI for Sankatmochan.
 *
 * useComponent: registers React components the agent can render:
 *   - emergency_card: structured emergency case card
 *   - case_timeline: ordered timeline of case events
 *
 * useHumanInTheLoop: approval gates for irreversible actions:
 *   - confirm_dispatch: approve dispatching rescue units
 */
import { useComponent, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

/* ── Emergency Card ──────────────────────────────────────────── */
interface EmergencyCardProps {
  headline?: string;
  summary?: string;
  severity?: string;
  language?: string;
  location?: string;
  facts?: Array<{ label?: string; value?: string } | null> | null;
  actions?: Array<string | null> | null;
}

function EmergencyCard({
  headline,
  summary,
  severity,
  language,
  location,
  facts,
  actions,
}: EmergencyCardProps) {
  const sevColor: Record<string, string> = {
    CRITICAL: "#ef4444",
    HIGH: "#eab308",
    MEDIUM: "#3b82f6",
    LOW: "#6b7280",
  };
  const color = sevColor[severity ?? ""] ?? "#3FD9C8";

  return (
    <div
      style={{
        background: "#0D1117",
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 6,
        padding: "12px 14px",
        fontFamily: "'IBM Plex Sans', sans-serif",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        {severity && (
          <span
            style={{
              background: `${color}20`,
              color,
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {severity}
          </span>
        )}
        {language && (
          <span style={{ fontSize: 10, color: "#8b5cf6" }}>{language}</span>
        )}
        {location && (
          <span style={{ fontSize: 10, color: "#5A6575" }}>📍 {location}</span>
        )}
      </div>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#E6EAF0", margin: "0 0 4px" }}>
        {headline || "Assessing emergency…"}
      </h3>
      <p style={{ fontSize: 11.5, color: "#C3CCD8", margin: "0 0 8px", lineHeight: 1.5 }}>
        {summary || "Gathering details…"}
      </p>
      {!!facts?.length && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px 12px",
            marginBottom: 8,
          }}
        >
          {facts.map((f, i) => (
            <div key={i}>
              <span style={{ fontSize: 9, color: "#5A6575", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {f?.label || "—"}
              </span>
              <div style={{ fontSize: 11, color: "#C3CCD8" }}>{f?.value || "—"}</div>
            </div>
          ))}
        </div>
      )}
      {!!actions?.length && (
        <div style={{ borderTop: "1px solid #1A2029", paddingTop: 6, marginTop: 4 }}>
          <span style={{ fontSize: 9, color: "#5A6575", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            RECOMMENDED ACTIONS
          </span>
          <ul style={{ margin: "4px 0 0", padding: "0 0 0 16px" }}>
            {actions.map((a, i) => (
              <li key={i} style={{ fontSize: 11, color: "#C3CCD8", marginBottom: 2 }}>
                {a || "—"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Case Timeline ───────────────────────────────────────────── */
interface TimelineProps {
  title?: string;
  events?: Array<{
    time?: string;
    action?: string;
    status?: string;
    detail?: string;
  } | null> | null;
}

function CaseTimeline({ title, events }: TimelineProps) {
  const statusColor: Record<string, string> = {
    done: "#10b981",
    active: "#06b6d4",
    pending: "#5A6575",
  };

  return (
    <div
      style={{
        background: "#0D1117",
        border: "1px solid #1A2029",
        borderRadius: 6,
        padding: "12px 14px",
        fontFamily: "'IBM Plex Sans', sans-serif",
        marginBottom: 8,
      }}
    >
      {title && (
        <h3 style={{ fontSize: 12, fontWeight: 600, color: "#E6EAF0", margin: "0 0 8px" }}>
          {title}
        </h3>
      )}
      {!events?.length ? (
        <p style={{ fontSize: 11, color: "#5A6575" }}>Loading timeline…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {events.map((e, i) => {
            const color = statusColor[e?.status ?? ""] ?? "#5A6575";
            return (
              <div
                key={i}
                style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    minWidth: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    marginTop: 4,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontSize: 10, color: "#5A6575", fontFamily: "'IBM Plex Mono', monospace" }}>
                      {e?.time || "—"}
                    </span>
                    <span style={{ fontSize: 11, color: "#E6EAF0", fontWeight: 500 }}>
                      {e?.action || "—"}
                    </span>
                  </div>
                  {e?.detail && (
                    <p style={{ fontSize: 10, color: "#8A95A6", margin: "2px 0 0" }}>
                      {e.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Hook registration ───────────────────────────────────────── */
export function GenerativeUI() {
  useComponent({
    name: "emergency_card",
    description:
      "Draw a structured emergency case card showing severity, language, location, key facts and recommended actions. Call this when summarising a case or showing critical information.",
    parameters: z.object({
      headline: z.string().describe("What the emergency is, in under 10 words"),
      summary: z.string().describe("Who is affected and what is happening"),
      severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
      language: z.string().optional().describe("Caller's language"),
      location: z.string().optional().describe("Location of the incident"),
      facts: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .max(6)
        .default([]),
      actions: z.array(z.string()).max(4).default([]),
    }),
    render: EmergencyCard,
  });

  useComponent({
    name: "case_timeline",
    description:
      "Draw an ordered timeline of case events. Call this when there are three or more events worth showing in sequence.",
    parameters: z.object({
      title: z.string().optional(),
      events: z.array(
        z.object({
          time: z.string(),
          action: z.string(),
          status: z.enum(["done", "active", "pending"]).default("done"),
          detail: z.string().optional(),
        }),
      ),
    }),
    render: CaseTimeline,
  });

  useHumanInTheLoop({
    name: "confirm_dispatch",
    description:
      "Ask the operator to approve dispatching a rescue unit, alerting a hospital, or escalating to NDRF. Call this BEFORE claiming any dispatch happened.",
    parameters: z.object({
      action: z
        .string()
        .describe("What will be dispatched or escalated, in one sentence"),
      caseId: z.string(),
      agency: z.string().describe("NDRF, SDRF, HOSPITAL, FIRE, or POLICE"),
      impact: z
        .string()
        .describe("What happens if this goes wrong"),
    }),
    render: ({ args, respond, result }) => {
      if (!respond) {
        return (
          <div
            style={{
              background: "#0D1117",
              border: "1px solid #1A2029",
              borderRadius: 6,
              padding: "12px 14px",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            <p style={{ fontSize: 11, color: result ? "#10b981" : "#5A6575" }}>
              {result ? String(result) : "Waiting for operator decision…"}
            </p>
          </div>
        );
      }
      return (
        <div
          style={{
            background: "#0D1117",
            border: "1px solid #ef444480",
            borderLeft: "3px solid #ef4444",
            borderRadius: 6,
            padding: "14px 16px",
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          <div style={{ fontSize: 9, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            ⚠️ DISPATCH APPROVAL REQUIRED
          </div>
          <h3 style={{ fontSize: 13, color: "#E6EAF0", margin: "0 0 4px", fontWeight: 600 }}>
            {args.action ?? "Confirm this dispatch"}
          </h3>
          <p style={{ fontSize: 11, color: "#8A95A6", margin: "0 0 4px" }}>
            Case: {args.caseId} · Agency: {args.agency}
          </p>
          <p style={{ fontSize: 11, color: "#C3CCD8", margin: "0 0 12px" }}>
            Impact: {args.impact}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() =>
                respond(
                  "Operator APPROVED the dispatch. Proceed and report what was dispatched.",
                )
              }
              style={{
                padding: "6px 16px",
                borderRadius: 4,
                border: "1px solid #ef4444",
                background: "#ef444420",
                color: "#ef4444",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✓ Approve Dispatch
            </button>
            <button
              type="button"
              onClick={() =>
                respond(
                  "Operator DECLINED. Do not dispatch. Say plainly that nothing was changed.",
                )
              }
              style={{
                padding: "6px 16px",
                borderRadius: 4,
                border: "1px solid #2A3340",
                background: "transparent",
                color: "#8A95A6",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      );
    },
  });

  return null;
}
