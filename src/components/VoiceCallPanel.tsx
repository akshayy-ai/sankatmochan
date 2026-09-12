"use client";

/**
 * VoiceCallPanel — 112 Emergency Voice Agent UI.
 *
 * Shows a phone-call interface with:
 * - Connect / Hang-up controls
 * - Live transcript (caller + agent + system events)
 * - Audio level visualizer
 * - Case creation alerts when the agent logs a case
 * - Dispatch alerts when units are sent
 */
import { useState, useRef, useCallback, useEffect } from "react";
import {
  startRealtimeSession,
  type RealtimeSession,
  type TranscriptEntry,
  type EmergencyCase,
  type DispatchRequest,
  type VoiceCallState,
} from "@/lib/realtime-client";

export default function VoiceCallPanel() {
  const [state, setState] = useState<VoiceCallState>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [muted, setMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [caseData, setCaseData] = useState<EmergencyCase | null>(null);
  const [dispatch, setDispatch] = useState<DispatchRequest | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const sessionRef = useRef<RealtimeSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Call timer
  useEffect(() => {
    if (state === "active" || state === "tool_calling") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (state === "ended" || state === "error" || state === "idle") {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const startCall = useCallback(async () => {
    setTranscript([]);
    setCaseData(null);
    setDispatch(null);
    setElapsed(0);

    try {
      const session = await startRealtimeSession({
        onStateChange: setState,
        onTranscript: (entry) =>
          setTranscript((prev) => [...prev, entry]),
        onCaseCreated: setCaseData,
        onDispatchRequested: setDispatch,
        onError: (error) => {
          setTranscript((prev) => [
            ...prev,
            { role: "system", text: `⚠️ ${error}`, timestamp: Date.now() },
          ]);
        },
        onAudioLevel: setAudioLevel,
      });
      sessionRef.current = session;
    } catch {
      // Error already handled by callbacks
    }
  }, []);

  const endCall = useCallback(() => {
    sessionRef.current?.stop();
    sessionRef.current = null;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      sessionRef.current?.mute(!m);
      return !m;
    });
  }, []);

  const isActive = state === "active" || state === "tool_calling" || state === "connecting";

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex-none flex items-center gap-2 px-4 py-3 border-b border-border">
        <span className="text-[15px]">📞</span>
        <span className="text-[10px] font-semibold tracking-[.14em] text-text-secondary">
          112 VOICE AGENT
        </span>
        {isActive && (
          <>
            <span
              className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold animate-pulse-critical"
              style={{ background: "#ef444420", color: "#ef4444" }}
            >
              LIVE
            </span>
            <span className="ml-auto font-mono text-[11px] text-text-dim">
              {formatTime(elapsed)}
            </span>
          </>
        )}
        {!isActive && (
          <span className="ml-auto text-[9px] text-text-dim">
            {state === "idle" ? "Ready" : state === "ended" ? "Call ended" : state}
          </span>
        )}
      </div>

      {/* Audio Level Indicator */}
      {isActive && (
        <div className="flex-none px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-text-dim font-mono">MIC</span>
            <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${Math.min(audioLevel * 100, 100)}%`,
                  background: audioLevel > 0.6 ? "#ef4444" : audioLevel > 0.3 ? "#eab308" : "#3FD9C8",
                }}
              />
            </div>
            {muted && (
              <span className="text-[8px] text-red-400 font-bold">MUTED</span>
            )}
          </div>
        </div>
      )}

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0"
      >
        {transcript.length === 0 && state === "idle" && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="text-[32px]">🎙️</div>
            <div className="text-[11px] text-text-dim leading-relaxed max-w-[240px]">
              Simulate a 112 emergency call. The AI agent speaks 10+ Indian
              languages and will triage your emergency in real time.
            </div>
          </div>
        )}

        {transcript.map((entry, i) => (
          <div key={i} className="flex gap-2">
            <span className="flex-none text-[10px] mt-0.5">
              {entry.role === "caller"
                ? "🗣️"
                : entry.role === "agent"
                  ? "🤖"
                  : "⚡"}
            </span>
            <div className="min-w-0">
              <span
                className="text-[8px] font-semibold tracking-[.1em] block mb-0.5"
                style={{
                  color:
                    entry.role === "caller"
                      ? "#3FD9C8"
                      : entry.role === "agent"
                        ? "#8b5cf6"
                        : "#eab308",
                }}
              >
                {entry.role === "caller"
                  ? "CALLER"
                  : entry.role === "agent"
                    ? "112 AGENT"
                    : "SYSTEM"}
              </span>
              <p
                className="text-[11px] leading-relaxed"
                style={{
                  color:
                    entry.role === "system" ? "#eab308" : "#E6EAF0",
                  fontStyle:
                    entry.role === "system" ? "italic" : "normal",
                }}
              >
                {entry.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Case Created Alert */}
      {caseData && (
        <div
          className="flex-none mx-3 mb-2 px-3 py-2 rounded text-[10px] border"
          style={{
            background: "#3FD9C810",
            borderColor: "#3FD9C840",
            color: "#3FD9C8",
          }}
        >
          <div className="font-bold mb-1">
            🚨 CASE LOGGED: {caseData.emergency_type}
          </div>
          <div className="text-text-dim">
            {caseData.severity} · {caseData.location} · {caseData.language}
          </div>
          <div className="mt-1 text-text-secondary text-[9px]">
            {caseData.description_english}
          </div>
        </div>
      )}

      {/* Dispatch Alert */}
      {dispatch && (
        <div
          className="flex-none mx-3 mb-2 px-3 py-2 rounded text-[10px] border"
          style={{
            background: "#ef444410",
            borderColor: "#ef444440",
            color: "#ef4444",
          }}
        >
          <div className="font-bold">
            🚑 DISPATCHED: {dispatch.agency} → {dispatch.location}
          </div>
          <div className="text-text-dim">
            Priority: {dispatch.priority}
            {dispatch.unit_type && ` · Unit: ${dispatch.unit_type}`}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex-none px-4 py-3 border-t border-border flex items-center justify-center gap-3">
        {state === "idle" || state === "ended" || state === "error" ? (
          <button
            onClick={startCall}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-105"
            style={{
              background: "#22c55e",
              color: "#fff",
            }}
          >
            <span>📞</span> Start 112 Call
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className="px-3 py-2 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: muted ? "#ef444430" : "#232C38",
                color: muted ? "#ef4444" : "#E6EAF0",
                border: `1px solid ${muted ? "#ef444460" : "#232C38"}`,
              }}
            >
              {muted ? "🔇 Unmute" : "🎤 Mute"}
            </button>
            <button
              onClick={endCall}
              className="px-5 py-2 rounded-lg text-[11px] font-semibold transition-all hover:scale-105"
              style={{
                background: "#ef4444",
                color: "#fff",
              }}
            >
              📵 End Call
            </button>
          </>
        )}
      </div>

      {state === "connecting" && (
        <div className="flex-none px-4 pb-3 text-center text-[10px] text-text-dim animate-pulse">
          Connecting to 112 Voice Agent...
        </div>
      )}
    </div>
  );
}
