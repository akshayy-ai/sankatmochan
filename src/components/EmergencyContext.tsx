"use client";

/**
 * EmergencyContext — feeds case data + tools to CopilotKit.
 *
 * useAgentContext: tells the agent about the currently selected case,
 * the full case queue, and live news alerts.
 *
 * useFrontendTool: registers tools the agent can call from the dashboard:
 *   - select_case: switch to a different case
 *   - search_news: query Exa for disaster news
 *   - get_case_summary: get a structured summary of any case
 *   - escalate_case: propose escalating a case to NDRF/emergency services
 */
import { useFrontendTool, useAgentContext } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { CASES, type CrisisCase } from "@/data/mock";

type Props = {
  selectedCase: CrisisCase | null;
  onSelectCase: (id: string) => void;
};

export function EmergencyContext({ selectedCase, onSelectCase }: Props) {
  // ── Feed the agent the full emergency context ──────────────
  useAgentContext({
    description:
      "The Sankatmochan emergency response dashboard state: selected crisis case with native language text, translation, severity, location, timeline, and the full case queue. Use this context to help the operator.",
    value: JSON.parse(JSON.stringify({
      selectedCase: selectedCase
        ? {
            id: selectedCase.id,
            severity: selectedCase.severity,
            category: selectedCase.category,
            language: selectedCase.lang,
            languageCode: selectedCase.langCode,
            nativeText: selectedCase.nativeText,
            englishTranslation: selectedCase.englishText,
            transliteration: selectedCase.translit,
            location: selectedCase.location,
            coordinates: selectedCase.coords,
            channel: selectedCase.channel,
            time: selectedCase.time,
            status: selectedCase.status,
            tags: selectedCase.tags,
            slaMinutes: selectedCase.slaMinutes,
            confidence: selectedCase.sourceConfidence,
            alert: selectedCase.alert,
            timeline: selectedCase.timeline.map((t) => ({
              time: t.time,
              action: t.action,
              status: t.status,
              detail: t.detail,
              duration: t.duration,
            })),
          }
        : null,
      caseQueue: CASES.map((c) => ({
        id: c.id,
        severity: c.severity,
        category: c.category,
        language: c.lang,
        location: c.location,
        status: c.status,
        nativeText: c.nativeText.slice(0, 80),
      })),
      activeCounts: {
        total: CASES.length,
        critical: CASES.filter((c) => c.severity === "CRITICAL").length,
        high: CASES.filter((c) => c.severity === "HIGH").length,
        medium: CASES.filter((c) => c.severity === "MEDIUM").length,
        low: CASES.filter((c) => c.severity === "LOW").length,
      },
      languages: [...new Set(CASES.map((c) => c.lang))],
    })),
  });

  // ── Tool: Select a different case ──────────────────────────
  useFrontendTool(
    {
      name: "select_case",
      description:
        "Switch the dashboard to show a different crisis case. Use a case ID from the caseQueue (e.g. CASE-0471).",
      parameters: z.object({
        caseId: z.string().describe("The case ID to select, e.g. CASE-0471"),
      }),
      handler: async ({ caseId }) => {
        const found = CASES.find((c) => c.id === caseId);
        if (!found) {
          return `Case ${caseId} not found. Available: ${CASES.map((c) => c.id).join(", ")}`;
        }
        onSelectCase(caseId);
        return `Switched to ${found.id}: ${found.category} — ${found.location}. Severity: ${found.severity}. Language: ${found.lang}. "${found.englishText}"`;
      },
    },
    [onSelectCase],
  );

  // ── Tool: Get structured case summary ──────────────────────
  useFrontendTool(
    {
      name: "get_case_summary",
      description:
        "Get a detailed structured summary of any case by ID, including full timeline and tags.",
      parameters: z.object({
        caseId: z.string().describe("The case ID to summarise"),
      }),
      handler: async ({ caseId }) => {
        const c = CASES.find((cas) => cas.id === caseId);
        if (!c) return { error: `Case ${caseId} not found` };
        return {
          id: c.id,
          severity: c.severity,
          category: c.category,
          language: `${c.lang} (${c.langCode})`,
          caller: {
            nativeText: c.nativeText,
            english: c.englishText,
            transliteration: c.translit,
          },
          location: `${c.location} · ${c.coords}`,
          channel: c.channel,
          status: c.status,
          confidence: c.sourceConfidence,
          tags: c.tags,
          slaMinutes: c.slaMinutes,
          alert: c.alert ?? null,
          timeline: c.timeline,
        };
      },
    },
    [],
  );

  // ── Tool: Search Exa news ──────────────────────────────────
  useFrontendTool(
    {
      name: "search_news",
      description:
        "Search for live disaster/emergency news using the Exa API. Use for flood updates, weather alerts, earthquake reports, NDRF deployments, etc.",
      parameters: z.object({
        query: z.string().describe("Search query for emergency news"),
        hours: z
          .number()
          .int()
          .min(1)
          .max(720)
          .default(24)
          .describe("How many hours back to search"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(5)
          .describe("Max results"),
      }),
      handler: async ({ query, hours, limit }) => {
        try {
          const res = await fetch(
            `/api/news?topic=custom&q=${encodeURIComponent(query)}&hours=${hours}&limit=${limit}`,
          );
          if (!res.ok) {
            return { error: `News search failed: ${res.status}` };
          }
          const data = await res.json();
          return {
            query,
            resultCount: data.articles?.length ?? 0,
            articles: (data.articles ?? []).map(
              (a: { title: string; url: string; publishedDate: string; highlights: string[] }) => ({
                title: a.title,
                url: a.url,
                published: a.publishedDate,
                highlight: a.highlights?.[0] ?? "",
              }),
            ),
          };
        } catch {
          return { error: "News search is unavailable. Check EXA_API_KEY configuration." };
        }
      },
    },
    [],
  );

  // ── Tool: Escalate case ────────────────────────────────────
  useFrontendTool(
    {
      name: "escalate_case",
      description:
        "PROPOSE escalating a case to NDRF, state disaster authority, or emergency hospital. This does NOT execute the escalation — it prepares a proposal for the operator to confirm. Always use this before claiming an escalation happened.",
      parameters: z.object({
        caseId: z.string(),
        agency: z
          .enum(["NDRF", "SDRF", "HOSPITAL", "FIRE", "POLICE"])
          .describe("Which agency to escalate to"),
        reason: z
          .string()
          .describe("Why this escalation is recommended"),
        priority: z
          .enum(["IMMEDIATE", "URGENT", "STANDARD"])
          .default("URGENT"),
      }),
      handler: async ({ caseId, agency, reason, priority }) => {
        const c = CASES.find((cas) => cas.id === caseId);
        if (!c) return { error: `Case ${caseId} not found` };
        return {
          status: "PROPOSAL_READY",
          message: `Escalation to ${agency} proposed for ${caseId}. Awaiting operator confirmation.`,
          proposal: {
            caseId,
            agency,
            reason,
            priority,
            caseDetails: `${c.category} at ${c.location} — ${c.englishText}`,
            severity: c.severity,
          },
        };
      },
    },
    [],
  );

  // ── Tool: Execute dispatch via Ambiguous AI ───────────────
  useFrontendTool(
    {
      name: "dispatch_to_agency",
      description:
        "EXECUTE a confirmed dispatch to an emergency agency via the Ambiguous AI workspace. Creates a tracked task and sends a notification email. Only call this AFTER the operator has confirmed the escalation proposal via the confirm_dispatch approval gate.",
      parameters: z.object({
        caseId: z.string(),
        agency: z
          .enum(["NDRF", "SDRF", "HOSPITAL", "FIRE", "POLICE"])
          .describe("Target agency"),
        reason: z.string().describe("Reason for dispatch"),
        priority: z
          .enum(["IMMEDIATE", "URGENT", "STANDARD"])
          .default("URGENT"),
      }),
      handler: async ({ caseId, agency, reason, priority }) => {
        const c = CASES.find((cas) => cas.id === caseId);
        if (!c) return { error: `Case ${caseId} not found` };
        try {
          const res = await fetch("/api/dispatch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caseId,
              agency,
              reason,
              priority,
              caseDetails: `${c.category} at ${c.location} — ${c.englishText}`,
              severity: c.severity,
              location: c.location,
              language: c.lang,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { error: data.error ?? `Dispatch failed: ${res.status}` };
          }
          return {
            status: "DISPATCHED",
            message: `✅ ${agency} dispatch confirmed. Task tracked in Ambiguous workspace.`,
            ...data,
          };
        } catch (err) {
          return {
            error: `Dispatch request failed: ${err}`,
            fallback:
              "Manual dispatch required — call the agency directly.",
          };
        }
      },
    },
    [],
  );

  // Hooks only — no visible output
  return null;
}
