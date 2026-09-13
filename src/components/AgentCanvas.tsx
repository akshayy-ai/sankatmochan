"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  type Node, type Edge, Position, MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import AgentNode, { type AgentNodeData } from "./AgentNode";
import type { CrisisCase } from "@/data/mock";
import { FLOW, agoLabel, pipelineStats, type StageId } from "@/lib/pipelineStats";

const nodeTypes = { agent: AgentNode };

/** Column per stage group, so the graph reads left to right as a real flow. */
const COLUMN: Record<string, number> = { INGEST: 0, UNDERSTAND: 1, ENRICH: 2, ACT: 3 };
const COL_W = 240;
const ROW_H = 132;

type Props = { cases: CrisisCase[] };

export default function AgentCanvas({ cases }: Props) {
  // Relative labels ("12s ago") go stale silently unless something re-renders.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  // Live traffic only. The seeded demo rows carry wall-clock strings instead of
  // dates and channel labels that predate the current ingest routes, so folding
  // them in would put invented ages and phantom channels on the graph — the
  // same blending that once made the console advertise an ingest path that did
  // not exist. They stay in the queue; they just do not claim to be traffic.
  const liveCases = useMemo(() => cases.filter((c) => c.isLive), [cases]);
  const seededCount = cases.length - liveCases.length;

  const stats = useMemo(() => pipelineStats(liveCases), [liveCases]);

  const { nodes, edges } = useMemo(() => {
    const byId = new Map(stats.map((s) => [s.stage.id, s]));

    // Position within a column, so groups stack vertically and stay centred.
    const perColumn = new Map<number, number>();
    const nodes: Node<AgentNodeData>[] = stats.map((s) => {
      const col = COLUMN[s.stage.group];
      const row = perColumn.get(col) ?? 0;
      perColumn.set(col, row + 1);

      return {
        id: s.stage.id,
        type: "agent",
        position: { x: 40 + col * COL_W, y: 40 + row * ROW_H },
        data: {
          label: s.stage.label,
          sponsor: s.stage.sponsor,
          icon: s.stage.icon,
          count: s.count,
          ago: agoLabel(s.lastAt, now),
          onLatestPath: s.onLatestPath,
          inHouse: s.stage.sponsor === "Sankatmochan",
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    const edges: Edge[] = FLOW.map(([from, to]: [StageId, StageId]) => {
      const a = byId.get(from);
      const b = byId.get(to);
      // An edge is only "flowing" where both ends have actually seen traffic.
      // Animating a path nothing has travelled is the same lie the old canvas
      // told with its hardcoded statuses.
      const flowing = Boolean(a?.count && b?.count);
      const onPath = Boolean(a?.onLatestPath && b?.onLatestPath);

      return {
        id: `${from}-${to}`,
        source: from,
        target: to,
        animated: onPath,
        style: {
          stroke: onPath ? "#3FD9C8" : flowing ? "#3FD9C833" : "#1E2328",
          strokeWidth: onPath ? 2 : 1.25,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: onPath ? "#3FD9C8" : flowing ? "#3FD9C855" : "#1E2328",
          width: 14,
          height: 14,
        },
      };
    });

    return { nodes, edges };
  }, [stats, now]);

  const liveCount = liveCases.length;
  const dispatched = stats.find((s) => s.stage.id === "dispatch")?.count ?? 0;
  const acked = stats.find((s) => s.stage.id === "ack")?.count ?? 0;

  return (
    <div className="w-full h-full relative">
      {/* What the graph is, stated plainly — a judge should not have to guess
          whether these numbers are real. */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 font-mono">
        <div className="px-2.5 py-1.5 rounded-md bg-surface-raised/90 border border-border backdrop-blur">
          <div className="text-[9px] text-text-dim tracking-wider">LIVE CASES INGESTED</div>
          <div className="text-sm font-bold text-teal tabular-nums leading-tight">
            {liveCount}
            {seededCount > 0 && (
              <span className="text-[9px] text-text-dim font-normal">
                {" "}· {seededCount} seeded excluded
              </span>
            )}
          </div>
        </div>
        <div className="px-2.5 py-1.5 rounded-md bg-surface-raised/90 border border-border backdrop-blur">
          <div className="text-[9px] text-text-dim tracking-wider">DISPATCHED</div>
          <div className="text-sm font-bold text-text-secondary tabular-nums leading-tight">
            {dispatched}
            <span className="text-[9px] text-text-dim font-normal"> · {acked} ack</span>
          </div>
        </div>
        <div className="text-[9px] text-text-dim max-w-[300px] leading-snug">
          {liveCount === 0 ? (
            <>
              No live traffic yet — every stage reads{" "}
              <span className="text-text-dim/70">idle</span>. Message{" "}
              <span className="text-teal/70">@sankatmochan_112_bot</span> and watch a
              path light up.
            </>
          ) : (
            <>
              Counts come from cases this deployment actually ingested. A stage
              nothing has passed through reads{" "}
              <span className="text-text-dim/70">idle</span>.
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-3 left-16 z-10 flex items-center gap-3 font-mono text-[9px] text-text-dim">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-[2px] bg-teal" /> newest case&apos;s path
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-[1px]" style={{ background: "#3FD9C833" }} /> has carried traffic
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-[1px]" style={{ background: "#1E2328" }} /> never used
        </span>
        <span className="italic opacity-60">italic sponsor = our own logic</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
      >
        <Background color="rgba(255,255,255,0.02)" gap={24} />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor={(n) => ((n.data as AgentNodeData)?.count > 0 ? "#3FD9C8" : "#1E2328")}
          maskColor="rgba(8,9,12,0.85)"
        />
      </ReactFlow>
    </div>
  );
}
