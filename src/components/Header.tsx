"use client";

import type { CrisisCase } from "@/data/mock";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";

export type ViewKey = "console" | "pipeline" | "stats" | "bridge" | "voice";

type Props = {
  view: ViewKey;
  onViewChange: (v: ViewKey) => void;
  /**
   * The same list the sidebar renders, live cases included.
   *
   * These counters used to read the seeded CASES array directly, so they
   * ignored every live case and contradicted the queue sitting directly
   * beneath them — and the gap widened with each new case that arrived.
   */
  cases: CrisisCase[];
};

const TABS: { key: ViewKey; label: string; shortcut: string; planned?: boolean }[] = [
  { key: "console", label: "Console", shortcut: "1" },
  { key: "pipeline", label: "Pipeline", shortcut: "2" },
  { key: "stats", label: "Shift Stats", shortcut: "3" },
  // Not built. Marked so nobody opens it expecting a working feature.
  { key: "bridge", label: "Bridge", shortcut: "4", planned: true },
  { key: "voice", label: "📞 Voice", shortcut: "5" },
];

export default function Header({ view, onViewChange, cases }: Props) {
  // Counted over exactly what the sidebar renders. These must agree: they sit
  // inches apart on screen, and a mismatch is what an operator notices first.
  // An operator who claimed a case in this session owns it just as much as one
  // seeded with an owner, so both fields count.
  const critCount = cases.filter((c) => c.severity === "CRITICAL").length;
  const openCount = cases.length;
  const unclaimedCount = cases.filter((c) => !c.owner && !c.claimedBy).length;
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-[52px] min-h-[52px] bg-surface border-b border-border flex items-stretch font-mono">
      {/* Logo */}
      <div className="flex items-center gap-[11px] px-4 border-r border-border min-w-[272px]">
        {/* Tricolour rail — the mark reads as Indian civic infrastructure
            before a single word is read. Kept to a 3px edge so it never
            competes with the severity colours the operator is scanning for. */}
        <div className="flex items-center gap-[9px]">
          <div className="flex flex-col w-[3px] h-6 rounded-sm overflow-hidden">
            <span className="flex-1" style={{ background: "#FF9933" }} />
            <span className="flex-1" style={{ background: "#F2F2F2" }} />
            <span className="flex-1" style={{ background: "#138808" }} />
          </div>
          <div className="w-6 h-6 rounded bg-teal flex items-center justify-center">
            <span className="text-[12px] font-semibold" style={{ color: "#07110F" }}>सं</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-[6px]">
            <span className="text-[12px] font-semibold text-text-primary tracking-[.14em] leading-none font-sans">
              SANKATMOCHAN
            </span>
            <span className="text-[8.5px] leading-none" style={{ color: "#6E7A8C" }}>
              संकटमोचन
            </span>
          </div>
          <div className="text-[8.5px] text-text-dim tracking-[.14em] leading-none">
            भारत · 112 ERC · PUNE · SHIFT B
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-stretch">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onViewChange(tab.key)}
            className={`px-5 text-[12px] font-medium tracking-wide transition-colors border-b-2 flex items-center gap-[7px] ${
              view === tab.key
                ? "text-text-primary border-teal"
                : "text-text-dim border-transparent hover:text-text-secondary"
            }`}
          >
            {tab.label}
            {tab.planned ? (
              <span
                className="text-[8px] font-semibold px-[4px] py-[1px] rounded tracking-wide"
                style={{ border: "1px solid #2A3644", color: "#5A6575" }}
              >
                PLANNED
              </span>
            ) : (
              <span className="text-[9px] text-text-dim">{tab.shortcut}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Right status */}
      <div className="flex items-center gap-5 px-4 text-[9.5px] tracking-[.09em]" style={{ color: "#8A95A6" }}>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse-critical" />
          <span className="text-critical font-medium">{critCount} CRIT</span>
        </span>
        <span>
          UNCLAIMED <span className="text-high font-medium">{unclaimedCount}</span>
        </span>
        <span>
          ASR <span className="text-teal font-medium">412ms</span>
        </span>
        <span className="text-text-secondary">{clock} IST</span>
      </div>

      {/* Operator — Auth0 user or fallback */}
      <UserMenu />
    </header>
  );
}
