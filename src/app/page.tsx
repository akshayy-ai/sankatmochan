"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import type { ViewKey } from "@/components/Header";
import CaseSidebar from "@/components/CaseSidebar";
import CaseDetail from "@/components/CaseDetail";
import CopilotPanel from "@/components/CopilotPanel";
import AgentCanvas from "@/components/AgentCanvas";
import VoiceCallPanel from "@/components/VoiceCallPanel";
import { EmergencyContext } from "@/components/EmergencyContext";
import { GenerativeUI } from "@/components/GenerativeUI";
import RegionalAlerts from "@/components/RegionalAlerts";
import { CASES } from "@/data/mock";
import { useAllCases } from "@/hooks/useTelegramCases";

export default function Home() {
  const [selectedCase, setSelectedCase] = useState<string | null>("CASE-0471");
  const [view, setView] = useState<ViewKey>("console");

  // Live ids are TG-/SMS-/CALL-; the seeded array is all CASE-04xx, so looking
  // only in CASES hands the agent a null context for every live case.
  const allCases = useAllCases();
  const selectedCaseData = allCases.find((c) => c.id === selectedCase) ?? null;

  const handleSelectCase = useCallback((id: string) => {
    setSelectedCase(id);
    setView("console");
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ minWidth: 1320, minHeight: 820 }}>
      {/* CopilotKit hooks — feed context + register tools + generative UI */}
      <EmergencyContext
        selectedCase={selectedCaseData}
        onSelectCase={handleSelectCase}
      />
      <GenerativeUI />

      <Header view={view} onViewChange={setView} />

      {/* Live regional picture, above the queue but outside it — an operator
          should see a flood unfolding upstream before the calls arrive. */}
      <RegionalAlerts />

      <div className="flex-1 flex min-h-0">
        {view === "console" ? (
          <>
            <CaseSidebar
              selectedCase={selectedCase}
              onSelectCase={handleSelectCase}
            />
            <main className="flex-1 min-w-0 min-h-0">
              <CaseDetail caseId={selectedCase} />
            </main>
            <CopilotPanel caseId={selectedCase} />
          </>
        ) : view === "pipeline" ? (
          <div className="flex-1 min-h-0">
            <AgentCanvas />
          </div>
        ) : view === "voice" ? (
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 flex items-center justify-center">
              <div
                className="rounded-xl border border-border overflow-hidden shadow-lg"
                style={{ width: 420, height: 620 }}
              >
                <VoiceCallPanel />
              </div>
            </div>
            <CopilotPanel caseId={selectedCase} />
          </div>
        ) : (
          /* Not implemented. The old empty state read like a working feature
             waiting on a selection, which is worse than saying so plainly. */
          <div className="flex-1 flex items-center justify-center font-mono px-6">
            <div className="text-center max-w-[520px]">
              <div className="text-[26px] mb-3" style={{ color: "#3B4553" }}>🔗</div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-[15px] font-bold text-text-primary">
                  Live Translation Bridge
                </span>
                <span
                  className="text-[8.5px] font-semibold px-[6px] py-[2px] rounded tracking-wide"
                  style={{ border: "1px solid #2A3644", color: "#8A95A6" }}
                >
                  PLANNED
                </span>
              </div>

              <p className="text-[12px] leading-relaxed mb-4" style={{ color: "#8A95A6" }}>
                A caller speaking Telugu and an SDRF responder speaking Marathi,
                held on one line with the agent interpreting both directions in
                real time — so neither has to wait for a human interpreter.
              </p>

              <div
                className="rounded-[5px] px-4 py-3 text-left"
                style={{ border: "1px solid #232C38", background: "#0D1117" }}
              >
                <div
                  className="text-[9px] font-semibold tracking-[.12em] mb-2"
                  style={{ color: "#6E7A8C" }}
                >
                  NOT BUILT YET — WHAT WORKS TODAY
                </div>
                <div className="text-[11.5px] leading-relaxed" style={{ color: "#C3CCD8" }}>
                  Translation runs on every case in the{" "}
                  <span className="text-teal">Console</span>, and the{" "}
                  <span className="text-teal">📞 Voice</span> agent already holds
                  a two-way conversation in the caller&apos;s own language.
                  Bridging a second live participant onto that call is the piece
                  that does not exist.
                </div>
              </div>

              <p className="text-[10px] mt-3" style={{ color: "#4E5A6B" }}>
                Listed here rather than hidden, because a demo should show its
                edges.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
