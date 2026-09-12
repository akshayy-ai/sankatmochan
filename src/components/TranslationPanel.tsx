"use client";

import { Languages } from "lucide-react";

type TranslationLine = {
  direction: "in" | "out";
  lang: string;
  text: string;
};

const TRANSLATION_LINES: TranslationLine[] = [
  { direction: "in", lang: "Telugu", text: "నీళ్ళు ఇంట్లోకి వస్తున్నాయి, మా అమ్మ మంచం మీద ఉంది" },
  { direction: "out", lang: "English", text: "Water is coming into the house, my mother is on the bed" },
  { direction: "in", lang: "Telugu", text: "కదలలేదు, భూమి అంతస్తు" },
  { direction: "out", lang: "English", text: "She cannot move, ground floor" },
  { direction: "in", lang: "Telugu", text: "వార్డు 12 నీటి మట్టం పెరుగుతోంది" },
  { direction: "out", lang: "English", text: "Ward 12 water level is rising" },
];

export default function TranslationPanel() {
  return (
    <div className="h-full bg-card rounded-xl border border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Languages size={14} className="text-safe" />
        <span className="text-[12px] font-medium text-foreground">
          Live Translation
        </span>
        <span className="text-[10px] text-dim ml-auto">
          Telugu ↔ English
        </span>
      </div>

      {/* Lines */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {TRANSLATION_LINES.map((line: TranslationLine, i: number) => (
          <div key={i}>
            <span className="text-[10px] font-medium text-dim uppercase tracking-wide">
              {line.direction === "in" ? line.lang : `→ ${line.lang}`}
            </span>
            <p className="text-[12px] text-muted leading-relaxed mt-0.5">
              {line.text}
            </p>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="px-4 py-2.5 border-t border-border flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse-dot" />
        <span className="text-[10px] text-dim">Streaming</span>
      </div>
    </div>
  );
}
