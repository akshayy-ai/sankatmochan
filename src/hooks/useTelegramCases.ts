"use client";

import { useEffect, useState } from "react";
import { CASES, type CrisisCase, type TimelineEvent } from "@/data/mock";

/**
 * Live Telegram case ingest.
 *
 * Polls /api/telegram/webhook every 3s and converts incoming TelegramCase
 * records into the CrisisCase shape the console already renders, so a message
 * sent from a phone appears in the operator sidebar within seconds.
 *
 * A single module-level poller is shared by every subscriber — mounting the
 * hook in three components must not open three intervals.
 */

type TelegramCase = {
  id: string;
  chatId: number;
  senderName: string;
  message: string;
  language: string;
  englishTranslation: string;
  severity: string;
  category: string;
  timestamp: string;
  location: string;
  channel: "TEXT" | "VOICE" | "PHOTO" | "CALL" | "SMS";
  audioTranscript?: string;
  imageAnalysis?: string;
  callerNumber?: string;
};

const LANG_CODE: Record<string, string> = {
  Hindi: "hi-IN",
  Marathi: "mr-IN",
  Telugu: "te-IN",
  Tamil: "ta-IN",
  Bengali: "bn-IN",
  Gujarati: "gu-IN",
  Kannada: "kn-IN",
  Malayalam: "ml-IN",
  Odia: "or-IN",
  Punjabi: "pa-IN",
  English: "en-IN",
};

/** Default to Pune so geocode/weather/map still resolve when no pin was shared */
const FALLBACK_COORDS = "18.5204,73.8567";

const SLA_BY_SEVERITY: Record<string, number> = {
  CRITICAL: 8,
  HIGH: 15,
  MEDIUM: 30,
  LOW: 60,
};

const CHANNEL_LABEL: Record<TelegramCase["channel"], string> = {
  TEXT: "TELEGRAM",
  VOICE: "TG VOICE",
  PHOTO: "TG PHOTO",
  CALL: "112 CALL",
  SMS: "SMS",
};

let liveCases: CrisisCase[] = [];
let pollStarted = false;
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((fn) => fn());
}

/** NONE is a real triage outcome, not an unknown label — show it as LOW. */
function normSeverity(s: string): CrisisCase["severity"] {
  if (s === "NONE") return "LOW";
  return (["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(s) ? s : "MEDIUM") as CrisisCase["severity"];
}

function buildTimeline(t: TelegramCase, hhmm: string): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      time: hhmm,
      action:
        t.channel === "CALL"
          ? "Inbound 112 voice call answered"
          : t.channel === "SMS"
          ? "Inbound SMS received"
          : `Inbound ${t.channel.toLowerCase()} message via Telegram`,
      badge: "ingest",
      duration: "0.1s",
      detail:
        t.channel === "CALL"
          ? `Vobiz telephony · caller ${t.callerNumber ?? t.senderName}`
          : t.channel === "SMS"
          ? `SMS gateway · sender ${t.callerNumber ?? t.senderName}`
          : `From ${t.senderName} · chat ${t.chatId}`,
      status: "done",
    },
  ];

  if (t.channel === "CALL") {
    events.push({
      time: hhmm,
      action: "Caller speech transcribed on the line",
      badge: "asr",
      duration: "1.2s",
      detail: `Vobiz ASR (${LANG_CODE[t.language] ?? "hi-IN"}) · ${t.audioTranscript ?? t.message}`,
      status: "done",
    });
  }

  if (t.channel === "VOICE") {
    events.push({
      time: hhmm,
      action: "Voice note transcribed",
      badge: "asr",
      duration: "1.8s",
      detail: `Whisper · ${t.audioTranscript ?? t.message}`,
      status: "done",
    });
  }

  if (t.channel === "PHOTO") {
    events.push({
      time: hhmm,
      action: "Emergency scene analysed",
      badge: "classify",
      duration: "2.4s",
      detail: `GPT-4o vision · ${t.imageAnalysis ?? "scene assessed"}`,
      status: "done",
    });
  }

  events.push(
    {
      time: hhmm,
      action: `Language detected — ${t.language}`,
      badge: "lang-id",
      duration: "0.3s",
      detail: `Script routed to ${LANG_CODE[t.language] ?? "en-IN"} renderer`,
      status: "done",
    },
    {
      time: hhmm,
      action: "Translated to English",
      badge: "translate",
      duration: "0.6s",
      detail: t.englishTranslation,
      status: "done",
    },
    {
      time: hhmm,
      action: `Classified ${normSeverity(t.severity)} · ${t.category}`,
      badge: "classify",
      duration: "0.5s",
      detail: "Severity and category assigned by triage model",
      status: "done",
    },
    {
      time: hhmm,
      action: "Awaiting operator dispatch",
      badge: "dispatch",
      duration: "—",
      detail: "Claim this case to assign responding units",
      status: "active",
    }
  );

  return events;
}

function toCrisisCase(t: TelegramCase): CrisisCase {
  const d = new Date(t.timestamp);
  const hhmm = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  const severity = normSeverity(t.severity);

  const hasPin = /-?\d+\.\d+\s*,\s*-?\d+\.\d+/.test(t.location);

  return {
    id: t.id,
    severity,
    category: t.category as CrisisCase["category"],
    lang: t.language,
    langCode: LANG_CODE[t.language] ?? "en-IN",
    nativeText: t.message,
    englishText: t.englishTranslation,
    translit: "",
    location: t.location,
    coords: hasPin ? t.location.replace(/\s/g, "") : FALLBACK_COORDS,
    channel: CHANNEL_LABEL[t.channel] as CrisisCase["channel"],
    timestamp: t.timestamp,
    time: hhmm,
    status: "TRIAGE",
    owner: null,
    fixNote: "",
    timeline: buildTimeline(t, hhmm),
    tags: [
      t.category,
      t.language,
      t.channel === "CALL"
        ? "VOBIZ:CALL"
        : t.channel === "SMS"
        ? "SMS:INBOUND"
        : `TG:${t.channel}`,
    ],
    slaMinutes: SLA_BY_SEVERITY[severity] ?? 30,
    isLive: true,
  };
}

function startPolling() {
  if (pollStarted) return;
  pollStarted = true;

  const tick = async () => {
    try {
      const res = await fetch("/api/telegram/webhook", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const incoming: TelegramCase[] = data.cases ?? [];
      const mapped = incoming.map(toCrisisCase);

      // Only re-render when the set of case ids actually changed
      const prevIds = liveCases.map((c) => c.id).join(",");
      const nextIds = mapped.map((c) => c.id).join(",");
      if (prevIds !== nextIds) {
        liveCases = mapped;
        notify();
      }
    } catch {
      // Offline or endpoint unavailable — keep whatever we already have
    }
  };

  tick();
  setInterval(tick, 3000);
}

/** Live Telegram cases only (newest first). */
export function useTelegramCases(): CrisisCase[] {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const sub = () => forceRender((n) => n + 1);
    subscribers.add(sub);
    startPolling();
    return () => {
      subscribers.delete(sub);
    };
  }, []);

  return liveCases;
}

/** Live Telegram cases followed by the seeded console cases. */
export function useAllCases(): CrisisCase[] {
  const live = useTelegramCases();
  return [...live, ...CASES];
}
