"use client";

import { CASES, type CrisisCase } from "@/data/mock";
import { useSlaTimer } from "@/hooks/useSlaTimer";
import { useGeocode, useWeather } from "@/hooks/useLiveData";
import IncidentMap from "./IncidentMap";

const sevColor: Record<CrisisCase["severity"], string> = {
  CRITICAL: "bg-critical text-white",
  HIGH: "bg-high text-bg",
  MEDIUM: "bg-medium text-white",
  LOW: "bg-resolved text-white",
};

const badgeColor: Record<string, string> = {
  ingest: "bg-[#141B25] text-[#5A6575]",
  "lang-id": "bg-teal-dim text-teal",
  asr: "bg-[#141B25] text-[#8A95A6]",
  translate: "bg-[#141B25] text-teal",
  classify: "bg-[#1E1012] text-critical",
  geo: "bg-[#141B25] text-high",
  dispatch: "bg-[#141B25] text-high",
  bridge: "bg-teal-dim text-teal",
  notify: "bg-[#141B25] text-teal",
  resolve: "bg-[#141B25] text-[#5A6575]",
  verify: "bg-[#141B25] text-[#5A6575]",
};

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

type Props = { caseId: string | null };

export default function CaseDetail({ caseId }: Props) {
  const c = CASES.find((x) => x.id === caseId) ?? CASES[0];
  const scriptFont = SCRIPT_FONT[c.langCode] ?? "'IBM Plex Sans'";
  const sla = useSlaTimer(c.id, c.slaMinutes);
  const { geo } = useGeocode(c.coords);
  const { weather } = useWeather(c.coords);

  return (
    <div className="h-full flex flex-col font-mono overflow-hidden" style={{ background: "#08090C" }}>
      {/* ── Case header ── */}
      <div className="px-5 pt-[13px] pb-3 border-b border-border">
        {/* Row 1: ID + badges + SLA */}
        <div className="flex items-start justify-between mb-[7px]">
          <div className="flex items-center gap-[9px] flex-wrap">
            <span className="text-[16px] font-semibold text-text-primary tracking-[.03em]">{c.id}</span>
            <span className={`text-[9.5px] font-semibold px-[6px] py-1 rounded ${sevColor[c.severity]}`}>
              {c.severity}
            </span>
            <span
              className="text-[9.5px] font-medium px-[6px] py-1 rounded"
              style={{ border: "1px solid #232C38", color: "#8A95A6" }}
            >
              {c.category}
            </span>
            {c.owner && (
              <span className="text-[9px] tracking-[.1em]" style={{ color: "#5A6575" }}>
                CLAIMED BY <span style={{ color: "#C3CCD8" }}>{c.owner}</span>
              </span>
            )}
          </div>
          <div className="text-right flex-none">
            <div className="text-[8.5px] tracking-[.12em] mb-[5px]" style={{ color: "#6E7A8C" }}>
              SLA REMAINING
            </div>
            <div
              className={`text-[26px] font-semibold leading-none tracking-tight ${
                sla.isCritical ? "text-critical animate-blink-sla" : ""
              }`}
              style={{ color: sla.isCritical ? undefined : sla.isWarning ? "#E8A33D" : "#E6EAF0" }}
            >
              {sla.isExpired ? (
                <span className="text-critical">BREACH</span>
              ) : (
                sla.display
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Metadata */}
        <div className="flex gap-4 flex-wrap text-[10.5px]" style={{ color: "#6E7A8C" }}>
          <span>
            OPENED <span style={{ color: "#C3CCD8" }}>{c.time} IST</span>
          </span>
          <span>
            CALLER <span style={{ color: "#C3CCD8" }}>+91 94xx xx{c.id.slice(-4)}</span>
          </span>
          <span>
            CH <span style={{ color: "#C3CCD8" }}>{c.channel}</span>
          </span>
          <span>
            LANG <span className="text-teal">{c.lang} ({c.langCode})</span>
          </span>
        </div>

        {/* Live data chips — geocode + weather */}
        <div className="flex gap-3 flex-wrap mt-[7px]">
          {geo && (
            <span
              className="text-[9.5px] font-medium px-[8px] py-[4px] rounded flex items-center gap-[5px]"
              style={{ background: "#0F1923", border: "1px solid #1A2D3D", color: "#8DC6E8" }}
            >
              <span style={{ fontSize: 11 }}>📍</span>
              {geo.short}
            </span>
          )}
          {weather && (
            <span
              className="text-[9.5px] font-medium px-[8px] py-[4px] rounded flex items-center gap-[5px]"
              style={{
                background: weather.condition.toLowerCase().includes("rain") ? "#1A1208" : "#0F1923",
                border: `1px solid ${weather.condition.toLowerCase().includes("rain") ? "#3D2A0F" : "#1A2D3D"}`,
                color: weather.condition.toLowerCase().includes("rain") ? "#E8A33D" : "#8DC6E8",
              }}
            >
              <span style={{ fontSize: 11 }}>{weather.emoji}</span>
              {weather.temp_c}°C · {weather.condition}
              {parseFloat(weather.precip_mm) > 0 && (
                <span style={{ color: "#E8A33D" }}> · {weather.precip_mm}mm rain</span>
              )}
            </span>
          )}
          {weather && (
            <span
              className="text-[9.5px] px-[8px] py-[4px] rounded flex items-center gap-[5px]"
              style={{ background: "#0F1923", border: "1px solid #1A2D3D", color: "#6E7A8C" }}
            >
              💨 {weather.wind_kmph} km/h {weather.wind_dir} · 💧 {weather.humidity}%
            </span>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 pt-[14px] pb-6">
        {/* Alert banner */}
        {c.alert && (
          <div
            className="mb-4 rounded-[5px] p-[12px]"
            style={{
              border: `1px solid ${c.alert.color}33`,
              background: c.alert.color === "#F2544F" ? "#1E1012" : "#1C1608",
            }}
          >
            <div className="flex items-center gap-[9px] mb-[6px]">
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: c.alert.color }} />
              <span className="text-[9px] font-semibold tracking-[.12em]" style={{ color: c.alert.color }}>
                {c.alert.kind}
              </span>
              <span className="flex-1" />
              <button
                className="text-[9.5px] font-medium tracking-[.08em] px-[9px] py-[5px] rounded cursor-pointer"
                style={{ border: "1px solid #2A3644", background: "#141B25", color: "#C3CCD8" }}
              >
                {c.alert.action}
              </button>
            </div>
            <div className="text-[11.5px] font-sans leading-relaxed" style={{ color: "#C3CCD8", maxWidth: "88ch" }}>
              {c.alert.body}
            </div>
          </div>
        )}

        {/* Incident map */}
        <IncidentMap cases={[c]} selected={c} />

        {/* Source + Translation */}
        <div
          className="rounded-[5px] overflow-hidden mb-[18px]"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1A2029", border: "1px solid #1A2029" }}
        >
          {/* Source (native) */}
          <div style={{ background: "#0D1117", padding: "13px 15px" }}>
            <div className="flex items-center gap-2 mb-[9px]">
              <span className="text-[8.5px] font-semibold tracking-[.13em]" style={{ color: "#6E7A8C" }}>
                SOURCE · {c.lang} ({c.langCode})
              </span>
              {c.sourceConfidence != null && (
                <span className="text-[9px] font-medium text-teal">ASR {c.sourceConfidence.toFixed(2)}</span>
              )}
            </div>
            <p
              className="leading-[1.6]"
              style={{ fontFamily: `${scriptFont}, 'IBM Plex Sans', sans-serif`, fontSize: 15, color: "#E6EAF0" }}
            >
              {c.nativeText}
            </p>
            {c.translit && (
              <p className="mt-2 text-[10.5px] italic" style={{ color: "#5A6575" }}>
                {c.translit}
              </p>
            )}
          </div>

          {/* Machine translation */}
          <div style={{ background: "#0D1117", padding: "13px 15px" }}>
            <div className="flex items-center gap-2 mb-[9px]">
              <span className="text-[8.5px] font-semibold tracking-[.13em]" style={{ color: "#6E7A8C" }}>
                MACHINE TRANSLATION · EN
              </span>
              {c.bleuScore != null && (
                <span className="text-[9px] font-medium text-teal">BLEU {c.bleuScore}</span>
              )}
            </div>
            <p className="text-[15px] font-sans leading-[1.55]" style={{ color: "#E6EAF0" }}>
              {c.englishText}
            </p>
            {/* Entity tags */}
            <div className="flex flex-wrap gap-[5px] mt-[10px]">
              {c.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-medium px-[6px] py-[3px] rounded"
                  style={{ border: "1px solid #232C38", color: "#8A95A6" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── System Action Timeline ── */}
        <div className="flex items-center gap-[10px] mb-3">
          <span className="text-[9.5px] font-semibold tracking-[.14em]" style={{ color: "#8A95A6" }}>
            ACTION LOG
          </span>
          <span className="flex-1 h-px" style={{ background: "#1A2029" }} />
          <span className="text-[8.5px]" style={{ color: "#4E5A6B" }}>
            {c.timeline.length} EVENTS · {c.timeline.filter((e) => e.status === "done").reduce((s, e) => s + (parseFloat(e.duration) || 0), 0).toFixed(1)}s PIPELINE
          </span>
        </div>

        <div className="flex flex-col">
          {c.timeline.map((ev, i) => (
            <div
              key={i}
              className="animate-[sankSlide_.22s_ease_both]"
              style={{ display: "grid", gridTemplateColumns: "62px 20px minmax(0,1fr)" }}
            >
              {/* Timestamp */}
              <div className="text-right pr-[10px] pt-[1px]">
                <div className="text-[9.5px]" style={{ color: "#5A6575", lineHeight: 1.4 }}>{ev.time}</div>
              </div>

              {/* Dot + line */}
              <div className="relative flex justify-center">
                <div className="absolute top-3 bottom-0 w-px" style={{ background: "#1A2029" }} />
                <div
                  className="w-[8px] h-[8px] rounded-full relative z-[1] mt-[3px]"
                  style={{
                    background:
                      ev.status === "done" ? "#3FD9C8" :
                      ev.status === "active" ? "#3FD9C8" : "#3B4553",
                    opacity: ev.status === "active" ? undefined : 1,
                  }}
                />
              </div>

              {/* Content */}
              <div className="pb-[15px] pl-[6px]">
                <div className="flex items-center gap-[7px] flex-wrap mb-[3px]">
                  <span
                    className="text-[11.5px] font-medium font-sans"
                    style={{ color: ev.status === "pending" ? "#5A6575" : "#E6EAF0", lineHeight: 1.35 }}
                  >
                    {ev.action}
                  </span>
                  <span className={`text-[8.5px] font-semibold px-[5px] py-[2px] rounded tracking-wide ${badgeColor[ev.badge] ?? "bg-[#141B25] text-[#5A6575]"}`}>
                    {ev.badge}
                  </span>
                  {ev.duration !== "—" && (
                    <span className="text-[8.5px]" style={{ color: "#4E5A6B" }}>{ev.duration}</span>
                  )}
                </div>
                <p className="text-[11px] font-sans leading-[1.5]" style={{ color: "#7D8799", maxWidth: "70ch" }}>
                  {ev.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="flex-none flex items-center gap-2 px-5 py-[10px] border-t border-border" style={{ background: "#0B0E13" }}>
        {[
          { label: "Police", dot: "#5B8CFF", key: "P" },
          { label: "Ambulance", dot: "#F2544F", key: "M" },
          { label: "Fire", dot: "#E8A33D", key: "F" },
        ].map((btn) => (
          <button
            key={btn.label}
            className="flex items-center gap-[7px] px-[13px] py-2 rounded text-[10.5px] font-medium font-sans cursor-pointer transition-colors hover:bg-[#1B2430]"
            style={{ border: "1px solid #2A3644", background: "#141B25", color: "#E6EAF0" }}
          >
            <span className="w-[5px] h-[5px] rounded-full" style={{ background: btn.dot }} />
            {btn.label}
            <span className="text-[8.5px]" style={{ color: "#5A6575" }}>{btn.key}</span>
          </button>
        ))}
        <span className="flex-1" />
        <button
          className="flex items-center gap-[7px] px-[13px] py-2 rounded text-[10.5px] font-semibold font-sans cursor-pointer hover:opacity-90"
          style={{ border: "1px solid #3FD9C8", background: "#0F2C29", color: "#3FD9C8" }}
        >
          Open bridge
          <span className="text-[8.5px]" style={{ color: "#2C9C90" }}>B</span>
        </button>
        <button
          className="px-[13px] py-2 rounded text-[10.5px] font-medium font-sans cursor-pointer hover:bg-[#2A1416]"
          style={{ border: "1px solid #4A2426", background: "#1E1012", color: "#F2544F" }}
        >
          Escalate
        </button>
      </div>
    </div>
  );
}
