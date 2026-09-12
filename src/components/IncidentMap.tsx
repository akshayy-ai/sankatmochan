"use client";

import { useEffect, useRef } from "react";
import type { CrisisCase } from "@/data/mock";

/* ── Leaflet CSS (injected once) ─────────────────────────────── */
const LEAFLET_CSS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

function ensureLeafletCSS() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${LEAFLET_CSS}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);
}

/* ── Severity → color mapping ────────────────────────────────── */
const SEV_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#eab308",
  MEDIUM: "#3b82f6",
  LOW: "#6b7280",
};

const CAT_EMOJI: Record<string, string> = {
  FLOOD: "🌊",
  MEDICAL: "🏥",
  FIRE: "🔥",
  SAFETY: "⚠️",
  MISSING: "🔍",
  DV: "🛡️",
};

/* ── Parse coords string "18.50, 73.80" → [lat, lng] ────────── */
function parseCoords(coords: string): [number, number] {
  const [lat, lng] = coords.split(",").map((s) => parseFloat(s.trim()));
  return [lat || 18.52, lng || 73.85];
}

/* ── Component ───────────────────────────────────────────────── */
type Props = {
  cases: CrisisCase[];
  selected?: CrisisCase | null;
  onSelect?: (c: CrisisCase) => void;
};

export default function IncidentMap({ cases, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    ensureLeafletCSS();

    let L: any;
    let cancelled = false;

    (async () => {
      // Dynamic import – Leaflet is client-only
      L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      // Don't re-init if already created
      if (mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [18.52, 73.85], // Pune center
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark-themed tile layer (CartoDB Dark Matter)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      // Zoom control on the right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Attribution (small, bottom-right)
      L.control
        .attribution({ prefix: false, position: "bottomright" })
        .addAttribution(
          '&copy; <a href="https://carto.com/">CARTO</a> · OSM'
        )
        .addTo(map);

      mapRef.current = map;

      // Add markers for all cases
      updateMarkers(L, map);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Update markers when cases change ──────────────────────── */
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((mod) => {
      updateMarkers(mod.default, mapRef.current);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, selected]);

  function updateMarkers(L: any, map: any) {
    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    cases.forEach((c) => {
      const [lat, lng] = parseCoords(c.coords);
      const color = SEV_COLORS[c.severity] || "#6b7280";
      const emoji = CAT_EMOJI[c.category] || "📍";
      const isSelected = selected?.id === c.id;
      const size = isSelected ? 18 : c.severity === "CRITICAL" ? 14 : 10;

      // Pulsing circle marker
      const pulseRadius = c.severity === "CRITICAL" ? 30 : 20;
      const pulseMarker = L.circleMarker([lat, lng], {
        radius: pulseRadius,
        color: color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1,
        opacity: 0.3,
        className: c.severity === "CRITICAL" ? "pulse-marker" : "",
      }).addTo(map);

      // Main marker with custom icon
      const icon = L.divIcon({
        className: "incident-marker",
        html: `
          <div style="
            width: ${size * 2}px;
            height: ${size * 2}px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid ${isSelected ? "#fff" : color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${size}px;
            box-shadow: 0 0 ${isSelected ? 20 : 10}px ${color}80;
            cursor: pointer;
            transition: all 0.2s;
          ">${emoji}</div>
        `,
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Popup
      marker.bindPopup(
        `<div style="
          font-family: system-ui, sans-serif;
          min-width: 200px;
          padding: 4px;
        ">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="
              background: ${color}22;
              color: ${color};
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
            ">${c.severity}</span>
            <span style="font-size: 12px; font-weight: 600;">${c.id}</span>
          </div>
          <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px;">
            ${emoji} ${c.category} — ${c.location}
          </div>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">
            ${c.nativeText.slice(0, 60)}${c.nativeText.length > 60 ? "…" : ""}
          </div>
          <div style="font-size: 11px; color: #aaa;">
            🗣️ ${c.lang} · ${c.channel} · ${c.time}
          </div>
          <div style="font-size: 11px; margin-top: 4px; color: ${color};">
            📡 ${c.status}
          </div>
        </div>`,
        { maxWidth: 280 }
      );

      marker.on("click", () => onSelect?.(c));

      markersRef.current.push(marker, pulseMarker);
    });

    // Fit bounds to show all markers
    if (cases.length > 1) {
      const coords = cases.map((c) => parseCoords(c.coords));
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else if (cases.length === 1) {
      const [lat, lng] = parseCoords(cases[0].coords);
      map.setView([lat, lng], 14);
    }
  }

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ border: "1px solid #1A2029" }}>
      {/* Header overlay */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-3 px-3 py-2 z-[1000]"
        style={{ background: "linear-gradient(180deg, rgba(10,14,19,0.92) 0%, transparent 100%)" }}
      >
        <span className="text-[9px] font-semibold tracking-widest" style={{ color: "#8A95A6" }}>
          LIVE INCIDENT MAP
        </span>
        <span className="flex-1" />
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px]" style={{ color: "#5A6575" }}>
            {cases.length} active · OSM + CARTO
          </span>
        </span>
      </div>

      {/* Map container */}
      <div ref={containerRef} style={{ height: 340, width: "100%" }} />

      {/* Legend */}
      <div
        className="absolute bottom-2 left-2 flex items-center gap-3 px-3 py-1.5 rounded z-[1000]"
        style={{ background: "rgba(10,14,19,0.85)", backdropFilter: "blur(8px)" }}
      >
        {Object.entries(SEV_COLORS).map(([sev, color]) => (
          <span key={sev} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[9px]" style={{ color: "#8A95A6" }}>
              {sev.charAt(0) + sev.slice(1).toLowerCase()}
            </span>
          </span>
        ))}
      </div>

      {/* Pulse animation */}
      <style>{`
        .pulse-marker {
          animation: pulse-ring 2s ease-out infinite;
        }
        @keyframes pulse-ring {
          0% { opacity: 0.4; }
          50% { opacity: 0.15; }
          100% { opacity: 0.4; }
        }
        .leaflet-popup-content-wrapper {
          background: #12121a !important;
          color: #e8e8f0 !important;
          border-radius: 8px !important;
          border: 1px solid #2a2a3d !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip {
          background: #12121a !important;
          border: 1px solid #2a2a3d !important;
        }
        .incident-marker {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
