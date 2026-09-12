"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Live SLA countdown hook — hydration-safe.
 *
 * Server render uses the static slaMinutes value (no Date.now()).
 * Client takes over after mount and ticks every second.
 */

// Stable start times per case — computed once on client, shared across hook instances
const caseStartTimes: Record<string, number> = {};

function getStartTime(caseId: string, slaMinutes: number): number {
  if (!caseStartTimes[caseId]) {
    const suffix = parseInt(caseId.replace(/\D/g, ""), 10) || 0;
    const elapsedFraction = ((suffix * 37) % 100) / 100;
    const elapsedMs = slaMinutes * 60 * 1000 * elapsedFraction;
    caseStartTimes[caseId] = Date.now() - elapsedMs;
  }
  return caseStartTimes[caseId];
}

function calcFromStart(caseId: string, slaMinutes: number) {
  const startTime = getStartTime(caseId, slaMinutes);
  const slaTotalMs = slaMinutes * 60 * 1000;
  const elapsed = Date.now() - startTime;
  return Math.max(0, slaTotalMs - elapsed);
}

export function useSlaTimer(caseId: string, slaMinutes: number) {
  // Start with static value to match server render (no Date.now on first render)
  const [remainingMs, setRemainingMs] = useState(slaMinutes * 60 * 1000);
  const mounted = useRef(false);

  useEffect(() => {
    // On mount, immediately compute real remaining and start ticking
    mounted.current = true;
    setRemainingMs(calcFromStart(caseId, slaMinutes));

    const id = setInterval(() => {
      setRemainingMs(calcFromStart(caseId, slaMinutes));
    }, 1000);
    return () => clearInterval(id);
  }, [caseId, slaMinutes]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalSeconds <= 0;
  const isCritical = minutes < 3;
  const isWarning = minutes < 8 && !isCritical;

  return {
    minutes,
    seconds,
    totalSeconds,
    isExpired,
    isCritical,
    isWarning,
    display: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    shortDisplay: isExpired ? "BREACH" : minutes > 99 ? "—" : `${minutes}m`,
  };
}
