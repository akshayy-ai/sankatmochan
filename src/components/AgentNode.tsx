"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import type { PipelineNode } from "@/data/mock";
import {
  PhoneIncoming, Mic, Brain, GitBranch, MapPin,
  PhoneCall, LayoutDashboard, Languages
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "phone-incoming": <PhoneIncoming size={18} />,
  "mic": <Mic size={18} />,
  "brain": <Brain size={18} />,
  "git-branch": <GitBranch size={18} />,
  "map-pin": <MapPin size={18} />,
  "phone-call": <PhoneCall size={18} />,
  "layout-dashboard": <LayoutDashboard size={18} />,
  "languages": <Languages size={18} />,
};

const statusStyle: Record<string, { border: string; iconColor: string }> = {
  done: { border: "border-teal/40", iconColor: "text-teal" },
  processing: { border: "border-high/40", iconColor: "text-high" },
  waiting: { border: "border-border", iconColor: "text-text-dim" },
  error: { border: "border-critical/40", iconColor: "text-critical" },
};

export default function AgentNode({ data }: NodeProps<PipelineNode>) {
  const s = statusStyle[data.status];

  return (
    <div className="flex flex-col items-center gap-1.5 group font-mono">
      <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-border !border-none" />

      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-surface-raised border ${s.border} transition-transform group-hover:scale-105`}>
        <span className={s.iconColor}>
          {iconMap[data.iconName] ?? <Brain size={18} />}
        </span>
      </div>

      <span className="text-[10px] font-bold text-text-secondary text-center leading-tight max-w-[90px] tracking-wide">
        {data.label}
      </span>
      <span className="text-[8px] text-text-dim text-center -mt-0.5 tracking-wider">
        {data.sponsor}
      </span>

      {data.status === "processing" && data.detail && (
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-teal-dim text-teal tracking-wide">
          {data.detail}
        </span>
      )}

      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-border !border-none" />
    </div>
  );
}
