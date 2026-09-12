"use client";

import { useMemo } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  type Node, type Edge, Position, MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import AgentNode from "./AgentNode";
import { PIPELINE_NODES } from "@/data/mock";

const nodeTypes = { agent: AgentNode };

function buildNodes(): Node[] {
  const row1 = PIPELINE_NODES.slice(0, 4);
  const row2 = PIPELINE_NODES.slice(4);
  const nodes: Node[] = [];

  row1.forEach((n, i) => {
    nodes.push({
      id: n.id, type: "agent",
      position: { x: 60 + i * 220, y: 60 },
      data: n, sourcePosition: Position.Right, targetPosition: Position.Left,
    });
  });

  row2.forEach((n, i) => {
    nodes.push({
      id: n.id, type: "agent",
      position: { x: 80 + i * 210, y: 280 },
      data: n, sourcePosition: Position.Right, targetPosition: Position.Top,
    });
  });

  return nodes;
}

function buildEdges(): Edge[] {
  const done = {
    style: { stroke: "#3FD9C830", strokeWidth: 1.5 },
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#3FD9C840" },
  };
  const pending = {
    style: { stroke: "#1E2328", strokeWidth: 1.5 },
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#1E2328" },
  };

  return [
    { id: "e1", source: "input", target: "stt", ...done },
    { id: "e2", source: "stt", target: "brain", ...done },
    { id: "e3", source: "brain", target: "route", ...pending },
    { id: "e4", source: "route", target: "location", ...done },
    { id: "e5", source: "route", target: "conference", ...pending },
    { id: "e6", source: "route", target: "dashboard", ...done },
    { id: "e7", source: "conference", target: "translate", ...pending },
  ];
}

export default function AgentCanvas() {
  const nodes = useMemo(() => buildNodes(), []);
  const edges = useMemo(() => buildEdges(), []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.35 }}
        minZoom={0.4} maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable nodesConnectable={false}
      >
        <Background color="rgba(255,255,255,0.02)" gap={24} />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            const s = node.data?.status;
            if (s === "done") return "#3FD9C8";
            if (s === "processing") return "#FF9800";
            return "#1E2328";
          }}
          maskColor="rgba(8,9,12,0.85)"
        />
      </ReactFlow>
    </div>
  );
}
