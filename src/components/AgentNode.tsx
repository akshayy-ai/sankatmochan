"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import {
  Send, MessageSquare, PhoneIncoming, Radio, Mic, Eye, Languages,
  MapPin, GitMerge, ShieldCheck, Timer, LayoutDashboard, Siren, CheckCheck,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  send: <Send size={16} />,
  message: <MessageSquare size={16} />,
  "phone-incoming": <PhoneIncoming size={16} />,
  radio: <Radio size={16} />,
  mic: <Mic size={16} />,
  eye: <Eye size={16} />,
  languages: <Languages size={16} />,
  "map-pin": <MapPin size={16} />,
  "git-merge": <GitMerge size={16} />,
  shield: <ShieldCheck size={16} />,
  timer: <Timer size={16} />,
  layout: <LayoutDashboard size={16} />,
  siren: <Siren size={16} />,
  check: <CheckCheck size={16} />,
};

export type AgentNodeData = {
  label: string;
  sponsor: string;
  icon: string;
  /** Cases that have passed this stage. Zero renders idle, never "done". */
  count: number;
  ago: string;
  /** The newest case in the queue came through here. */
  onLatestPath: boolean;
  /** Our own logic rather than a third-party call — styled differently. */
  inHouse: boolean;
};

export default function AgentNode({ data }: NodeProps<AgentNodeData>) {
  const live = data.count > 0;

  // Idle is a real state and must look like one. A stage nothing has passed
  // through is dim — the old canvas showed every node as "done" on a cold boot.
  const border = data.onLatestPath
    ? "border-teal"
    : live
      ? "border-teal/35"
      : "border-border";

  const iconColor = data.onLatestPath
    ? "text-teal"
    : live
      ? "text-teal/70"
      : "text-text-dim";

  return (
    <div className="flex flex-col items-center gap-1 font-mono group">
      <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-border !border-none" />

      <div className="relative">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center bg-surface-raised border ${border} transition-all group-hover:scale-105`}
          style={data.onLatestPath ? { boxShadow: "0 0 0 3px rgba(63,217,200,0.12)" } : undefined}
        >
          <span className={iconColor}>{iconMap[data.icon] ?? <Timer size={16} />}</span>
        </div>

        {live && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-teal text-[9px] font-bold
                       flex items-center justify-center tabular-nums"
            style={{ color: "#08090C" }}
            title={`${data.count} case${data.count === 1 ? "" : "s"} passed this stage`}
          >
            {data.count}
          </span>
        )}
      </div>

      <span className="text-[10px] font-bold text-text-secondary text-center leading-tight max-w-[104px] tracking-wide">
        {data.label}
      </span>

      <span
        className={`text-[8px] text-center -mt-0.5 tracking-wider ${
          data.inHouse ? "text-text-dim/60 italic" : "text-text-dim"
        }`}
        title={data.inHouse ? "Our own logic, not a third-party service" : "Called at runtime"}
      >
        {data.sponsor}
      </span>

      <span className={`text-[8px] tabular-nums ${live ? "text-teal/60" : "text-text-dim/50"}`}>
        {data.ago}
      </span>

      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-border !border-none" />
    </div>
  );
}
