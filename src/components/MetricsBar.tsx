"use client";

import { Activity, Radio, Zap, IndianRupee, Globe } from "lucide-react";

const stats = [
  { value: "12", label: "Cases today", Icon: Activity, accent: "text-text-primary" },
  { value: "3", label: "Active now", Icon: Radio, accent: "text-critical" },
  { value: "4.8s", label: "Avg response", Icon: Zap, accent: "text-active-orange" },
  { value: "₹63", label: "Cost today", Icon: IndianRupee, accent: "text-success" },
  { value: "22+", label: "Languages", Icon: Globe, accent: "text-info" },
];

export default function MetricsBar() {
  return (
    <div className="flex items-center px-6 py-3 gap-6 bg-surface border-b border-border">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <s.Icon size={14} className="text-text-tertiary" />
          <span className={`text-[15px] font-semibold ${s.accent}`}>{s.value}</span>
          <span className="text-[11px] text-text-tertiary">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
