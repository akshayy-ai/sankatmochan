"use client";

import { CASES } from "@/data/mock";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";

export type ViewKey = "console" | "pipeline" | "bridge" | "voice";

type Props = {
  view: ViewKey;
  onViewChange: (v: ViewKey) => void;
};

const TABS: { key: ViewKey; label: string; shortcut: string }[] = [
  { key: "console", label: "Console", shortcut: "1" },
  { key: "pipeline", label: "Pipeline", shortcut: "2" },
  { key: "bridge", label: "Bridge", shortcut: "3" },
  { key: "voice", label: "📞 Voice", shortcut: "4" },
];

export default function Header({ view, onViewChange }: Props) {
  const critCount = CASES.filter((c) => c.severity === "CRITICAL").length;
  const openCount = CASES.length;
  const unclaimedCount = CASES.filter((c) => !(c as any).owner).length;
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
            <span className="text-[9px] text-text-dim">{tab.shortcut}</span>
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
