"use client";

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { useBoard } from "@/lib/store";
import type { Task, TaskState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { STATE_META } from "./status";

const NODE_W = 236;
const NODE_H = 84;

interface TaskNodeData extends Record<string, unknown> {
  task: Task;
  state: TaskState;
  blockCode: string;
  ownerName: string | null;
  mine: boolean;
  dim: boolean;
  selected: boolean;
}
type TaskFlowNode = Node<TaskNodeData, "task">;

function TaskNode({ data }: NodeProps<TaskFlowNode>) {
  const meta = STATE_META[data.state];
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-raised text-left transition-opacity",
        data.selected ? "border-fg" : "border-line-strong",
        data.state === "locked" && "opacity-55",
        data.dim && "opacity-20",
      )}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-line-strong" />
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: meta.color }} />
      <div className="flex h-full flex-col justify-between py-2.5 pr-3 pl-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-muted">{data.task.code}</span>
          <span className={cn("flex items-center gap-1 text-[11px]", meta.text)}>
            <Icon size={11} />
            {meta.label}
          </span>
        </div>
        <p className="line-clamp-2 text-[12.5px] leading-snug font-medium">{data.task.title}</p>
        <p className="truncate text-[11px] text-faint">
          {data.ownerName ? (data.mine ? "You" : data.ownerName) : data.state === "locked" ? "Waiting" : "Unclaimed"}
        </p>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-line-strong" />
    </div>
  );
}

const nodeTypes = { task: TaskNode };

export function TaskGraph({
  matched,
  selectedId,
  onOpen,
}: {
  matched: Set<string>;
  selectedId: string | null;
  onOpen: (code: string) => void;
}) {
  const board = useBoard();

  // positions only depend on the shape of the graph, not on who owns what
  const shapeKey = useMemo(
    () =>
      board.tasks
        .map((t) => t.id)
        .sort()
        .join(",") +
      "|" +
      board.deps
        .map((d) => `${d.task_id}>${d.depends_on_id}`)
        .sort()
        .join(","),
    [board.tasks, board.deps],
  );

  const positions = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", ranksep: 90, nodesep: 22, marginx: 20, marginy: 20 });
    g.setDefaultEdgeLabel(() => ({}));
    for (const t of board.tasks) g.setNode(t.id, { width: NODE_W, height: NODE_H });
    for (const d of board.deps) {
      if (g.hasNode(d.task_id) && g.hasNode(d.depends_on_id)) g.setEdge(d.depends_on_id, d.task_id);
    }
    dagre.layout(g);
    const map = new Map<string, { x: number; y: number }>();
    for (const t of board.tasks) {
      const n = g.node(t.id);
      if (n) map.set(t.id, { x: n.x - NODE_W / 2, y: n.y - NODE_H / 2 });
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeKey]);

  const nodes = useMemo<TaskFlowNode[]>(
    () =>
      board.tasks.map((task) => {
        const owner = task.claimed_by ? board.memberById.get(task.claimed_by) : null;
        return {
          id: task.id,
          type: "task",
          position: positions.get(task.id) ?? { x: 0, y: 0 },
          draggable: false,
          connectable: false,
          data: {
            task,
            state: board.stateOf(task),
            blockCode: board.blockById.get(task.block_id)?.code ?? "",
            ownerName: owner?.name ?? null,
            mine: owner?.id === board.me?.id,
            dim: !matched.has(task.id),
            selected: task.id === selectedId,
          },
        };
      }),
    [board, positions, matched, selectedId],
  );

  const edges = useMemo<Edge[]>(
    () =>
      board.deps.map((d) => {
        const source = board.taskById.get(d.depends_on_id);
        const satisfied = source?.status === "done";
        const dim = !matched.has(d.task_id) || !matched.has(d.depends_on_id);
        return {
          id: `${d.depends_on_id}>${d.task_id}`,
          source: d.depends_on_id,
          target: d.task_id,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: satisfied ? "#4d7a62" : "#4a4f57",
          },
          style: { stroke: satisfied ? "#4d7a62" : "#3b4048", strokeWidth: 1.25, opacity: dim ? 0.25 : 1 },
        };
      }),
    [board.deps, board.taskById, matched],
  );

  if (board.tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line py-16 text-center text-[13px] text-muted">
        There is nothing to draw yet.
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-250px)] min-h-[520px] overflow-hidden rounded-xl border border-line bg-panel">
      <ReactFlow
        key={shapeKey}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
        minZoom={0.1}
        maxZoom={1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onNodeClick={(_, node) => {
          const task = board.taskById.get(node.id);
          if (task) onOpen(task.code);
        }}
        panOnScroll
        zoomOnScroll={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#262a2f" />
        <Controls showInteractive={false} />
        <Panel position="top-left">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-line bg-raised px-3 py-2 text-[11px] text-muted">
            {(["locked", "open", "claimed", "in_progress", "done"] as TaskState[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm" style={{ background: STATE_META[s].color }} />
                {STATE_META[s].label}
              </span>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
