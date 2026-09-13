"use client";

import { CASES, type CrisisCase } from "@/data/mock";
import { useSlaTimer } from "@/hooks/useSlaTimer";
import { useGeocode, useWeather } from "@/hooks/useLiveData";
import {
  recommendAgencies,
  agencyLabel,
  priorityFor,
  type Agency,
} from "@/lib/dispatchRouting";
import { useState, useEffect } from "react";
import { useAllCases } from "@/hooks/useTelegramCases";
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
  const allCases = useAllCases();
  const c = allCases.find((x) => x.id === caseId) ?? CASES[0];
  const scriptFont = SCRIPT_FONT[c.langCode] ?? "'IBM Plex Sans'";
  const sla = useSlaTimer(c.id, c.slaMinutes);
  const { geo } = useGeocode(c.coords);
  const { weather } = useWeather(c.coords);

  // Which agencies this case needs, derived from its own category and
  // severity rather than a fixed row of buttons that ignored the case.
  const recommended = recommendAgencies(c.category, c.severity);
  const [sent, setSent] = useState<Record<string, "sending" | "sent" | "failed">>({});
  const [dismissed, setDismissed] = useState(false);

  /**
   * Clearing a flag is a human judgement, recorded on the case.
   *
   * The system over-reports on purpose — an unreadable photo, an
   * unclassifiable message, a caller who went quiet all become cases. That
   * trade only holds if clearing one is a single click; otherwise the queue
   * fills with noise, the operator stops reading it, and over-reporting causes
   * the miss it was meant to prevent.
   */
  async function dismissReview() {
    setDismissed(true);
    try {
      await fetch("/api/cases/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: c.id }),
      });
    } catch {
      setDismissed(false);
    }
  }

  // Nearest real stations from OpenStreetMap, so a dispatch names WHICH one.
  type Facility = { type: string; name: string; km: number; phone?: string; roadKm?: number; etaMin?: number };
  const [facilities, setFacilities] = useState<Facility[]>([]);
  useEffect(() => {
    const [lat, lng] = c.coords.split(",").map((v) => parseFloat(v.trim()));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    let live = true;
    fetch(`/api/facilities?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d) => { if (live) setFacilities(d.facilities || []); })
      .catch(() => {});
    return () => { live = false; };
  }, [c.coords]);

  // Pull acknowledgement state back from the workspace while this case is
  // open. Without it, "dispatched" and "nobody opened it" look identical.
  useEffect(() => {
    if (!c.dispatched?.length) return;
    const pull = () => fetch(`/api/dispatch/status?caseId=${encodeURIComponent(c.id)}`).catch(() => {});
    pull();
    const id = setInterval(pull, 20000);
    return () => clearInterval(id);
  }, [c.id, c.dispatched?.length]);

  const OSM_TYPE: Record<string, string> = {
    POLICE: "police",
    FIRE: "fire_station",
    HOSPITAL: "hospital",
  };
  /** Closest facility matching an agency, if OSM knows one. */
  function nearestFor(agency: string): Facility | undefined {
    const t = OSM_TYPE[agency];
    return t ? facilities.find((f) => f.type === t) : undefined;
  }

  async function dispatchTo(agency: Agency, reason: string) {
    setSent((p) => ({ ...p, [agency]: "sending" }));
    try {
      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: c.id,
          agency,
          reason,
          priority: priorityFor(c.severity),
          severity: c.severity,
          location: geo?.short || c.location,
          language: c.lang,
          caseDetails: c.englishText,
          nearestFacility: nearestFor(agency)
            ? `${nearestFor(agency)!.name} — ${
                nearestFor(agency)!.roadKm ?? nearestFor(agency)!.km
              } km${
                nearestFor(agency)!.etaMin
                  ? `, ~${nearestFor(agency)!.etaMin} min drive (free-flow, no traffic)`
                  : ""
              }`
            : undefined,
        }),
      });
      setSent((p) => ({ ...p, [agency]: res.ok ? "sent" : "failed" }));
    } catch {
      setSent((p) => ({ ...p, [agency]: "failed" }));
    }
  }

  return (
    <div className="h-full flex flex-col font-mono overflow-hidden" style={{ background: "#08090C" }}>
      {/* ── Case header ── */}
      <div className="px-5 pt-[13px] pb-3 border-b border-border">
        {/* Row 1: ID + badges + SLA */}
        <div className="flex items-start justify-between mb-[7px]">
          <div className="flex items-center gap-[9px] flex-wrap">
            <span className="text-[16px] font-semibold text-text-primary tracking-[.03em]">{c.id}</span>
            {c.isLive && (
              <span
                className="text-[9px] font-semibold px-[6px] py-1 rounded flex items-center gap-[5px]"
                style={{ background: "#0F2C29", color: "#3FD9C8" }}
              >
                <span
                  className="w-[4px] h-[4px] rounded-full animate-pulse"
                  style={{ background: "#3FD9C8" }}
                />
                LIVE INGEST
              </span>
            )}
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
        {/* Caller context — advisory only. This never hides, reorders or
            downgrades a case; it tells an operator what a previous operator
            already decided about this sender, and nothing more. */}
        {c.credibility && c.credibility.level !== "normal" && (
          <div
            className="mb-4 rounded-[5px] p-[12px]"
            style={{
              border: `1px solid ${c.credibility.level === "corroborated" ? "#1A3D2D" : "#2A3644"}`,
              background: c.credibility.level === "corroborated" ? "#0C1A14" : "#0D1117",
            }}
          >
            <div className="flex items-center gap-[9px] mb-[5px]">
              <span
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: c.credibility.level === "corroborated" ? "#3FD9C8" : "#8A95A6" }}
              />
              <span
                className="text-[9px] font-semibold tracking-[.12em]"
                style={{ color: c.credibility.level === "corroborated" ? "#3FD9C8" : "#8A95A6" }}
              >
                {c.credibility.level === "corroborated" ? "CORROBORATED" : "CALLER HISTORY"}
              </span>
            </div>
            <div className="text-[11.5px] font-sans leading-relaxed" style={{ color: "#C3CCD8", maxWidth: "84ch" }}>
              {c.credibility.note}
            </div>
          </div>
        )}

        {/* Review flags — why this case wants a human look, and one click to
            say it does not. */}
        {!dismissed && (c.attention?.length ?? 0) > 0 && (
          <div
            className="mb-4 rounded-[5px] p-[12px] flex items-start gap-3"
            style={{ border: "1px solid #3D2A0F", background: "#1A1208" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[9px] mb-[5px]">
                <span className="w-[5px] h-[5px] rounded-full" style={{ background: "#E8A33D" }} />
                <span className="text-[9px] font-semibold tracking-[.12em]" style={{ color: "#E8A33D" }}>
                  NEEDS REVIEW
                </span>
                <span className="text-[9px]" style={{ color: "#6E7A8C" }}>
                  {c.attention!.join(" · ")}
                </span>
              </div>
              <div className="text-[11.5px] font-sans leading-relaxed" style={{ color: "#C3CCD8", maxWidth: "80ch" }}>
                {c.attention!.includes("CANNOT_SPEAK")
                  ? "The caller indicated they cannot speak. Treat as urgent and do not call back on an open line."
                  : "Filed because automatic analysis was incomplete or the message did not read as an emergency. It is here so a person decides, not a classifier."}
              </div>
            </div>
            <button
              onClick={dismissReview}
              className="flex-none text-[9.5px] font-medium px-[10px] py-[5px] rounded cursor-pointer hover:bg-[#1B2430]"
              style={{ border: "1px solid #2A3644", background: "#141B25", color: "#C3CCD8" }}
            >
              Not an emergency
            </button>
          </div>
        )}

        {/* Corroborating reports — only shown when others describe this same
            incident. Framed as evidence, not noise: independent reports of one
            fire are the strongest confirmation an operator can get. */}
        {c.cluster && (
          <div
            className="mb-4 rounded-[5px] p-[12px]"
            style={{
              border: `1px solid ${c.cluster.major ? "#4A2426" : "#232C38"}`,
              background: c.cluster.major ? "#1E1012" : "#0D1117",
            }}
          >
            <div className="flex items-center gap-[9px] mb-[5px]">
              <span
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: c.cluster.major ? "#F2544F" : "#8A95A6" }}
              />
              <span
                className="text-[9px] font-semibold tracking-[.12em]"
                style={{ color: c.cluster.major ? "#F2544F" : "#8A95A6" }}
              >
                {c.cluster.major ? "MAJOR INCIDENT" : "CORROBORATED"}
              </span>
              <span className="text-[9.5px]" style={{ color: "#6E7A8C" }}>
                {c.cluster.size} separate callers
              </span>
            </div>
            <div className="text-[11.5px] font-sans leading-relaxed" style={{ color: "#C3CCD8", maxWidth: "88ch" }}>
              {c.cluster.size} people have reported what appears to be this same{" "}
              {c.category.toLowerCase()} nearby, within the last 45 minutes.
              {c.cluster.major
                ? " Independent corroboration at this volume usually means a large or spreading event — consider escalating beyond the nearest single unit."
                : " Each caller remains separately contactable on their own case."}
            </div>
          </div>
        )}

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

      {/* ── Dispatch record ── */}
      {(c.dispatched?.length ?? 0) > 0 && (
        <div
          className="flex-none flex items-center gap-3 px-5 py-[7px] border-t border-border flex-wrap"
          style={{ background: "#0B0E13" }}
        >
          <span className="text-[8.5px] tracking-[.12em]" style={{ color: "#3FD9C8" }}>
            DISPATCHED
          </span>
          {c.dispatched!.map((d) => {
            // An unacknowledged request must not look like a handled one —
            // that ambiguity is exactly where a scene ends up waiting.
            const stale = d.escalated && (d.state ?? "pending") === "pending";
            const tone = stale
              ? { bg: "#1E1012", br: "#4A2426", fg: "#F2544F" }
              : d.state === "complete"
              ? { bg: "#0F1923", br: "#2A3644", fg: "#8A95A6" }
              : d.state === "accepted"
              ? { bg: "#0F2C29", br: "#2C9C90", fg: "#3FD9C8" }
              : { bg: "#1A1208", br: "#3D2A0F", fg: "#E8A33D" };
            return (
              <span
                key={d.agency}
                className="text-[9.5px] px-[8px] py-[3px] rounded flex items-center gap-[6px]"
                style={{ background: tone.bg, border: `1px solid ${tone.br}`, color: tone.fg }}
                title={d.taskId ? `Ambiguous workspace task ${d.taskId}` : undefined}
              >
                <span>{agencyLabel(d.agency as Agency)}</span>
                <span style={{ opacity: 0.8 }}>
                  {stale
                    ? "NO RESPONSE"
                    : d.state === "complete"
                    ? "COMPLETE"
                    : d.state === "accepted"
                    ? "ACCEPTED"
                    : "AWAITING"}
                </span>
                <span style={{ opacity: 0.65 }}>
                  {new Date(d.at).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Asia/Kolkata",
                  })}
                </span>
              </span>
            );
          })}
          {/* Named so it is obvious where the task actually lives, and so a
              reload cannot make a sent dispatch look unsent. */}
          <span className="text-[8.5px]" style={{ color: "#4E5A6B" }}>
            tracked in Ambiguous AI workspace
          </span>
        </div>
      )}

      {/* ── Nearest responding units ── */}
      {facilities.some((f) => f.etaMin) && (
        <div
          className="flex-none flex items-center gap-3 px-5 py-[7px] border-t border-border flex-wrap"
          style={{ background: "#0B0E13" }}
        >
          <span className="text-[8.5px] tracking-[.12em]" style={{ color: "#6E7A8C" }}>
            NEAREST UNITS
          </span>
          {recommended.map((r) => {
            const f = nearestFor(r.agency);
            if (!f?.etaMin) return null;
            return (
              <span
                key={r.agency}
                className="text-[9.5px] px-[8px] py-[3px] rounded flex items-center gap-[6px]"
                style={{ background: "#0F1923", border: "1px solid #1A2D3D", color: "#8DC6E8" }}
              >
                <span style={{ color: "#C3CCD8" }}>{f.name.slice(0, 30)}</span>
                <span style={{ color: "#6E7A8C" }}>
                  {f.roadKm ?? f.km} km · ~{f.etaMin} min
                </span>
              </span>
            );
          })}
          {/* Free-flow routing, no live traffic. Said plainly so nobody reads
              it as a guarantee — and it is never spoken to the caller. */}
          <span className="text-[8.5px]" style={{ color: "#4E5A6B" }}>
            drive time excludes traffic · operator view only
          </span>
        </div>
      )}

      {/* ── Bottom action bar ── */}
      <div className="flex-none flex items-center gap-2 px-5 py-[10px] border-t border-border" style={{ background: "#0B0E13" }}>
        {recommended.map((r) => {
          // Local state covers the moment of clicking; the case covers
          // everything after a reload.
          const already = c.dispatched?.find((d) => d.agency === r.agency);
          const st = sent[r.agency] ?? (already ? "sent" : undefined);
          const dot =
            r.agency === "POLICE" ? "#5B8CFF" :
            r.agency === "HOSPITAL" ? "#F2544F" :
            r.agency === "FIRE" ? "#E8A33D" : "#3FD9C8";
          return (
            <button
              key={r.agency}
              onClick={() => dispatchTo(r.agency, r.reason)}
              disabled={st === "sending" || st === "sent"}
              title={r.reason}
              className="flex items-center gap-[7px] px-[13px] py-2 rounded text-[10.5px] font-medium font-sans cursor-pointer transition-colors hover:bg-[#1B2430] disabled:cursor-default"
              style={{
                border: `1px solid ${st === "sent" ? "#2C9C90" : r.primary ? "#3A4757" : "#2A3644"}`,
                background: st === "sent" ? "#0F2C29" : "#141B25",
                color: st === "sent" ? "#3FD9C8" : "#E6EAF0",
                opacity: r.primary || st ? 1 : 0.72,
              }}
            >
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: dot }} />
              {agencyLabel(r.agency)}
              <span className="text-[8.5px]" style={{ color: "#5A6575" }}>
                {st === "sending" ? "…" :
                 st === "sent" ? "NOTIFIED" :
                 st === "failed" ? "RETRY" :
                 r.primary ? priorityFor(c.severity) : "ALSO"}
              </span>
              {nearestFor(r.agency) && (
                <span className="text-[8.5px]" style={{ color: "#6E7A8C" }}>
                  {nearestFor(r.agency)!.etaMin
                    ? `· ~${nearestFor(r.agency)!.etaMin}min`
                    : `· ${nearestFor(r.agency)!.km}km`}
                </span>
              )}
            </button>
          );
        })}
        <span className="flex-1" />
        <button
          className="flex items-center gap-[7px] px-[13px] py-2 rounded text-[10.5px] font-semibold font-sans cursor-pointer hover:opacity-90"
          style={{ border: "1px solid #3FD9C8", background: "#0F2C29", color: "#3FD9C8" }}
        >
          Open bridge
          <span className="text-[8.5px]" style={{ color: "#2C9C90" }}>PLANNED</span>
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
