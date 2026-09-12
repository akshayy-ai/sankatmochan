"use client";

import { useState } from "react";
import { CASES, type CrisisCase } from "@/data/mock";
import { useSlaTimer } from "@/hooks/useSlaTimer";
import { useAllCases } from "@/hooks/useTelegramCases";

/** Small component so we can call the SLA hook per-case inside the list */
function SlaChip({ caseId, slaMinutes }: { caseId: string; slaMinutes: number }) {
  const sla = useSlaTimer(caseId, slaMinutes);
  return (
    <span
      className="text-[9px] font-medium tabular-nums"
      style={{
        color: sla.isExpired
          ? "#F2544F"
          : sla.isCritical
          ? "#F2544F"
          : sla.isWarning
          ? "#E8A33D"
          : "#5A6575",
      }}
    >
      {sla.shortDisplay}
    </span>
  );
}

/* Map language codes to Noto Sans families */
const SCRIPT_FONT: Record<string, string> = {
  "te-IN": "'Noto Sans Telugu'",
  "mr-IN": "'Noto Sans Devanagari'",
  "hi-IN": "'Noto Sans Devanagari'",
  "bn-IN": "'Noto Sans Bengali'",
  "ta-IN": "'Noto Sans Tamil'",
  "or-IN": "'Noto Sans Oriya'",
  "gu-IN": "'Noto Sans Gujarati'",
};

const sevBarColor: Record<CrisisCase["severity"], string> = {
  CRITICAL: "#F2544F",
  HIGH: "#E8A33D",
  MEDIUM: "#5B8CFF",
  LOW: "#3B4553",
};

type Props = {
  selectedCase: string | null;
  onSelectCase: (id: string) => void;
};

export default function CaseSidebar({ selectedCase, onSelectCase }: Props) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<"sev" | "age" | "sla">("sev");

  /* Live Telegram cases ride at the top of the queue, ahead of seeded cases */
  const allCases = useAllCases();
  const liveCount = allCases.filter((c) => c.isLive).length;

  const filtered =
    filter === "all"
      ? allCases
      : filter === "mine"
      ? allCases.filter((c) => c.owner === "RK")
      : filter === "unclaimed"
      ? allCases.filter((c) => !c.owner)
      : filter === "critical"
      ? allCases.filter((c) => c.severity === "CRITICAL")
      : filter === "flagged"
      ? allCases.filter((c) => c.alert)
      : filter === "live"
      ? allCases.filter((c) => c.isLive)
      : allCases;

  const sortBtn = (key: typeof sort) =>
    `cursor-pointer text-[9px] font-medium tracking-[.09em] px-[5px] py-[3px] rounded ${
      sort === key ? "text-teal" : ""
    }` as const;

  const sortBtnStyle = (key: typeof sort) => ({
    border: sort === key ? "1px solid #3FD9C8" : "1px solid #232C38",
    background: sort === key ? "#0F2C29" : "transparent",
    color: sort === key ? "#3FD9C8" : "#5A6575",
  });

  return (
    <section className="w-[352px] min-w-[352px] flex flex-col border-r border-border overflow-hidden font-mono" style={{ background: "#0B0E13" }}>
      {/* Queue header + sorts + filters */}
      <div className="flex-none px-3 pt-[9px] pb-2 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9.5px] font-semibold tracking-[.14em]" style={{ color: "#8A95A6" }}>QUEUE</span>
          <span className="text-[9.5px] font-medium" style={{ color: "#4E5A6B" }}>
            {filtered.length}/{allCases.length}
          </span>
          {liveCount > 0 && (
            <span
              className="text-[8.5px] font-semibold px-[5px] py-[2px] rounded flex items-center gap-[4px]"
              style={{ background: "#0F2C29", color: "#3FD9C8" }}
            >
              <span
                className="w-[4px] h-[4px] rounded-full animate-pulse"
                style={{ background: "#3FD9C8" }}
              />
              {liveCount} LIVE
            </span>
          )}
          <span className="flex-1" />
          {(["sev", "age", "sla"] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)} className={sortBtn(s)} style={sortBtnStyle(s)}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-[5px]">
          {[
            { key: "all", label: "All" },
            { key: "live", label: "Live" },
            { key: "mine", label: "Mine" },
            { key: "unclaimed", label: "Unclaimed" },
            { key: "critical", label: "Critical" },
            { key: "flagged", label: "Needs review" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="text-[9.5px] px-[7px] py-[4px] rounded cursor-pointer transition-colors"
              style={{
                border: filter === f.key ? "1px solid #3FD9C8" : "1px solid #232C38",
                background: filter === f.key ? "#0F2C29" : "transparent",
                color: filter === f.key ? "#3FD9C8" : "#8A95A6",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Case list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((c) => {
          const isSelected = selectedCase === c.id;
          const scriptFont = SCRIPT_FONT[c.langCode] ?? "'IBM Plex Sans'";
          return (
            <button
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className="w-full text-left relative transition-colors hover:bg-[#131923]"
              style={{
                background: isSelected ? "#131923" : "transparent",
                borderBottom: "1px solid #1A2029",
              }}
            >
              {/* Severity bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: sevBarColor[c.severity] }}
              />

              <div
                className="flex items-center gap-2 px-[10px] py-[9px]"
                style={{ paddingLeft: 12, display: "grid", gridTemplateColumns: "50px 1fr 44px", alignItems: "center", gap: 8 }}
              >
                {/* Time */}
                <span className="text-[9.5px]" style={{ color: "#5A6575" }}>{c.time}</span>

                {/* Content */}
                <div className="min-w-0 flex flex-col gap-[3px]">
                  <div className="flex items-center gap-[7px] min-w-0">
                    <span className="text-[9.5px] font-medium" style={{ color: "#8A95A6" }}>{c.id.replace("CASE-", "")}</span>
                    <span
                      className="text-[8.5px] font-medium px-[5px] py-[2px] rounded"
                      style={{ border: "1px solid #232C38", color: "#8A95A6" }}
                    >
                      {c.langCode.split("-")[0]}
                    </span>
                    <span
                      className="text-[10px] truncate"
                      style={{
                        fontFamily: `${scriptFont}, 'IBM Plex Sans', sans-serif`,
                        color: "#C3CCD8",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.nativeText}
                    </span>
                  </div>
                  <div className="flex items-center gap-[7px] min-w-0">
                    <span
                      className="text-[10px] font-sans truncate"
                      style={{ color: "#7D8799", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {c.englishText}
                    </span>
                  </div>
                </div>

                {/* Right: SLA + owner */}
                <div className="flex items-center justify-end gap-[6px]">
                  <SlaChip caseId={c.id} slaMinutes={c.slaMinutes} />
                  {c.owner && (
                    <span
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-semibold"
                      style={{ background: "#1C2531", color: "#9FB0C4" }}
                    >
                      {c.owner}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Keyboard hint footer */}
      <div
        className="flex-none flex items-center gap-[10px] px-3 py-2 border-t border-border text-[9px] tracking-[.08em]"
        style={{ color: "#4E5A6B" }}
      >
        <span><span style={{ color: "#8A95A6" }}>J</span>/<span style={{ color: "#8A95A6" }}>K</span> move</span>
        <span><span style={{ color: "#8A95A6" }}>C</span> claim</span>
        <span><span style={{ color: "#8A95A6" }}>?</span> all keys</span>
      </div>
    </section>
  );
}
