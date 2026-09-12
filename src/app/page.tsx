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
          <div className="flex-1 flex items-center justify-center font-mono text-text-dim text-[13px]">
            <div className="text-center">
              <div className="text-teal text-[24px] mb-2">🔗</div>
              <div className="text-text-primary font-bold mb-1">Live Translation Bridge</div>
              <div>Select a case with an active bridge to view live translation stream</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
