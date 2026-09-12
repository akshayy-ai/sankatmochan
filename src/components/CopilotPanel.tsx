"use client";

/**
 * CopilotPanel — the real AI sidebar powered by CopilotKit.
 *
 * Replaces the hardcoded mock chat with a live CopilotChat that:
 * - Sees the selected case via useAgentContext (from EmergencyContext)
 * - Can render emergency_card / case_timeline via GenerativeUI
 * - Can search Exa news, select cases, and propose escalations
 */
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

type Props = { caseId: string | null };

export default function CopilotPanel({ caseId }: Props) {
  const shortId = caseId?.replace("CASE-", "") ?? "";

  useConfigureSuggestions(
    {
      suggestions: [
        {
          title: "Summarise this case",
          message:
            "Summarise the selected case using the dashboard context. Show an emergency card with severity, language, location and recommended actions.",
        },
        {
          title: "Show case timeline",
          message:
            "Show the timeline for the selected case using the case_timeline component.",
        },
        {
          title: "Search disaster news",
          message:
            "Search for the latest flood and disaster news for the selected case's region using Exa.",
        },
        {
          title: "Draft handoff note",
          message:
            "Draft a concise shift handoff note for the selected case covering current status, dispatched units, pending actions, and any translation concerns.",
        },
      ],
      available: "always",
    },
    [caseId],
  );

  return (
    <aside className="flex flex-col border-l border-border bg-surface overflow-hidden w-[360px] min-w-[360px]">
      {/* Header */}
      <div className="flex-none flex items-center gap-2 px-[14px] py-3 border-b border-border">
        <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-critical" />
        <span
          className="text-[9.5px] font-semibold tracking-[.14em]"
          style={{ color: "#C3CCD8" }}
        >
          COPILOT AI
        </span>
        <span
          className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-semibold"
          style={{ background: "#8b5cf620", color: "#8b5cf6" }}
        >
          LIVE
        </span>
        <span className="flex-1" />
        <span className="text-[8.5px] text-text-dim">{shortId}</span>
      </div>

      {/* CopilotKit Chat */}
      <CopilotChat
        className="copilot-chat-container"
        labels={{
          welcomeMessageText:
            "I can see the active cases. What do you need?",
          chatInputPlaceholder: "Ask about this case…",
        }}
      />

      {/* Custom styling for CopilotChat to match our dark theme */}
      <style>{`
        .copilot-chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        /* Override CopilotKit default styles for dark theme */
        .copilot-chat-container [class*="copilotkit"] {
          --copilotkit-background: #0A0E13;
          --copilotkit-foreground: #E6EAF0;
          --copilotkit-muted: #1A2029;
          --copilotkit-muted-foreground: #8A95A6;
          --copilotkit-border: #232C38;
          --copilotkit-primary: #3FD9C8;
          --copilotkit-primary-foreground: #0A0E13;
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          font-size: 11.5px;
        }
      `}</style>
    </aside>
  );
}
