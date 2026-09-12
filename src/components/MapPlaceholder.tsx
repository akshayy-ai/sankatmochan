"use client";

import { MapPin } from "lucide-react";

const MARKERS = [
  { id: "007", lang: "Telugu", status: "critical" as const, x: "55%", y: "50%" },
  { id: "006", lang: "Gujarati", status: "active" as const, x: "38%", y: "35%" },
  { id: "005", lang: "Tamil", status: "active" as const, x: "50%", y: "65%" },
  { id: "004", lang: "Odia", status: "resolved" as const, x: "65%", y: "42%" },
  { id: "003", lang: "Bengali", status: "resolved" as const, x: "72%", y: "32%" },
];

const dotColor: Record<string, string> = {
  critical: "bg-danger",
  active: "bg-accent",
  resolving: "bg-blue",
  resolved: "bg-safe",
};

export default function MapPlaceholder() {
  return (
    <div className="h-full bg-card rounded-xl border border-border relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header */}
      <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
        <MapPin size={13} className="text-blue" />
        <span className="text-[12px] font-medium text-foreground">Crisis Map</span>
      </div>

      {/* Markers */}
      {MARKERS.map((m) => (
        <div
          key={m.id}
          className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: m.x, top: m.y }}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor[m.status]} ${
            m.status === "critical" ? "animate-pulse-dot" : ""
          }`} />
          <span className="text-[9px] text-dim whitespace-nowrap">
            #{m.id}
          </span>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-3 left-4 flex items-center gap-3 z-10">
        {["critical", "active", "resolved"].map((s) => (
          <span key={s} className="flex items-center gap-1 text-[9px] text-dim">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor[s]}`} />
            {s}
          </span>
        ))}
      </div>

      {/* Count badge */}
      <div className="absolute top-3 right-4 text-[10px] text-dim z-10">
        5 cases
      </div>
    </div>
  );
}
