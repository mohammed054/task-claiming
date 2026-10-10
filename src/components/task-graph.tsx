"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { Maximize2, Minimize2 } from "lucide-react";
import { useBoard } from "@/lib/store";
import type { Priority, Task, TaskState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, STATE_META } from "./status";

const NODE_W = 300;
const NODE_H = 118;

/** One accent colour per block so the whole board reads at a glance. */
const BLOCK_COLORS = ["#6f9fd3", "#c8a560", "#6aa985", "#b48ead", "#d08770", "#5fb3b3", "#a3be8c", "#cf6b64"];

const PRIORITY_COLOR: Record<Priority, string> = {
  critical: "#cf6b64",
  high: "#c8a560",
  medium: "#959ba4",
  low: "#636973",
};

const STATE_HEX: Record<TaskState, string> = {
  locked: "#636973",
  open: "#aeb4bd",
  claimed: "#c8a560",
  in_progress: "#6f9fd3",
  done: "#6aa985",
};

interface TaskNodeData extends Record<string, unknown> {
  task: Task;
  state: TaskState;
  blockColor: string;
  blockCode: string;
  ownerName: string | null;
  mine: boolean;
  dim: boolean;
  focus: boolean;
  selected: boolean;
}
type TaskFlowNode = Node<TaskNodeData, "task">;

function TaskNode({ data }: NodeProps<TaskFlowNode>) {
  const meta = STATE_META[data.state];
  const Icon = meta.icon;
  const { task } = data;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-raised text-left shadow-lg shadow-black/30 transition-[opacity,border-color,box-shadow] duration-150",
        data.selected || data.focus ? "border-fg shadow-xl" : "border-line-strong",
        data.state === "locked" && "opacity-60",
        data.state === "in_progress" && "ring-1 ring-progress/40",
        data.mine && "ring-1 ring-claimed/60",
        data.dim && "!opacity-15",
      )}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-0 !bg-line-strong" />
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: data.blockColor }} />
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: meta.color }} />

      <div className="flex h-full flex-col justify-between py-3 pr-3.5 pl-4.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-mono text-[12px] text-muted">
            <span className="size-2 rounded-full" style={{ background: data.blockColor }} />
            {task.code}
          </span>
          <span className={cn("flex items-center gap-1.5 text-[12px] font-medium", meta.text)}>
            <Icon size={13} />
            {meta.label}
          </span>
        </div>

        <p className="line-clamp-2 text-[14.5px] leading-snug font-semibold text-fg">{task.title}</p>

        <div className="flex items-center justify-between gap-2 text-[12px]">
          <span className="flex min-w-0 items-center gap-2 text-muted">
            {data.ownerName ? (
              <>
                <Avatar name={data.ownerName} size={18} />
                <span className="truncate">{data.mine ? "You" : data.ownerName}</span>
              </>
            ) : (
              <span className="text-faint">{data.state === "locked" ? "Waiting on dependencies" : "Unclaimed"}</span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-2.5 text-faint">
            {task.estimate && <span>{task.estimate}</span>}
            <span
              title={`${task.priority} priority`}
              className="size-2 rounded-full"
              style={{ background: PRIORITY_COLOR[task.priority] ?? PRIORITY_COLOR.medium }}
            />
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-0 !bg-line-strong" />
    </div>
  );
}

const nodeTypes = { task: TaskNode };

/** Every task upstream and downstream of `id`, plus `id` itself. */
function chainOf(id: string, depsOf: Map<string, string[]>, dependentsOf: Map<string, string[]>): Set<string> {
  const seen = new Set<string>([id]);
  for (const map of [depsOf, dependentsOf]) {
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const next of map.get(cur) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          stack.push(next);
        }
      }
    }
  }
  return seen;
}

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
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !selectedId && setFull(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [full, selectedId]);

  const blockColor = useMemo(() => {
    const map = new Map<string, string>();
    board.blocks.forEach((b, i) => map.set(b.id, BLOCK_COLORS[i % BLOCK_COLORS.length]));
    return map;
  }, [board.blocks]);

  // positions only depend on the shape of the graph, not on who owns what
  const shapeKey = useMemo(
    () =>
      board.tasks
        .map((t) => `${t.id}:${t.block_id}`)
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
    g.setGraph({ rankdir: "LR", ranksep: 130, nodesep: 36, marginx: 40, marginy: 40, ranker: "network-simplex" });
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

  const focusSet = useMemo(
    () => (hoverId ? chainOf(hoverId, board.depsOf, board.dependentsOf) : null),
    [hoverId, board.depsOf, board.dependentsOf],
  );

  const nodes = useMemo<TaskFlowNode[]>(
    () =>
      board.tasks.map((task) => {
        const owner = task.claimed_by ? board.memberById.get(task.claimed_by) : null;
        const inFocus = focusSet ? focusSet.has(task.id) : true;
        return {
          id: task.id,
          type: "task",
          position: positions.get(task.id) ?? { x: 0, y: 0 },
          draggable: false,
          connectable: false,
          data: {
            task,
            state: board.stateOf(task),
            blockColor: blockColor.get(task.block_id) ?? BLOCK_COLORS[0],
            blockCode: board.blockById.get(task.block_id)?.code ?? "",
            ownerName: owner?.name ?? null,
            mine: owner?.id === board.me?.id,
            dim: !matched.has(task.id) || !inFocus,
            focus: task.id === hoverId,
            selected: task.id === selectedId,
          },
        };
      }),
    [board, positions, matched, selectedId, focusSet, hoverId, blockColor],
  );

  const edges = useMemo<Edge[]>(
    () =>
      board.deps.map((d) => {
        const source = board.taskById.get(d.depends_on_id);
        const satisfied = source?.status === "done";
        const inFocus = focusSet ? focusSet.has(d.task_id) && focusSet.has(d.depends_on_id) : false;
        const dim = !matched.has(d.task_id) || !matched.has(d.depends_on_id) || (focusSet !== null && !inFocus);
        const color = inFocus ? "#e7e8ea" : satisfied ? "#4d7a62" : "#4a4f57";
        return {
          id: `${d.depends_on_id}>${d.task_id}`,
          source: d.depends_on_id,
          target: d.task_id,
          type: "default",
          animated: inFocus,
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color },
          style: { stroke: color, strokeWidth: inFocus ? 2.25 : 1.5, opacity: dim ? 0.12 : 1 },
        };
      }),
    [board.deps, board.taskById, matched, focusSet],
  );

  const blockStats = useMemo(
    () =>
      board.blocks.map((b) => {
        const tasks = board.tasksByBlock.get(b.id) ?? [];
        const done = tasks.filter((t) => t.status === "done").length;
        return { block: b, total: tasks.length, done, color: blockColor.get(b.id) ?? BLOCK_COLORS[0] };
      }),
    [board.blocks, board.tasksByBlock, blockColor],
  );

  const miniColor = useCallback((n: Node) => STATE_HEX[(n.data as TaskNodeData).state], []);

  if (board.tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line py-16 text-center text-[13px] text-muted">
        There is nothing to draw yet.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden border border-line bg-panel",
        full
          ? "fixed inset-0 z-[35] h-dvh rounded-none"
          : "h-[calc(100dvh-210px)] min-h-[680px] rounded-xl",
      )}
    >
      <ReactFlow
        key={shapeKey}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.08, maxZoom: 1 }}
        minZoom={0.05}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        connectionLineType={ConnectionLineType.Bezier}
        onNodeClick={(_, node) => {
          const task = board.taskById.get(node.id);
          if (task) onOpen(task.code);
        }}
        onNodeMouseEnter={(_, node) => setHoverId(node.id)}
        onNodeMouseLeave={() => setHoverId(null)}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={26} size={1.2} color="#2a2e33" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          pannable
          zoomable
          nodeColor={miniColor}
          nodeStrokeWidth={0}
          maskColor="rgba(12,13,15,0.72)"
          style={{ background: "#121316", border: "1px solid #2a2d32", borderRadius: 8, width: 200, height: 130 }}
        />

        <Panel position="top-left">
          <div className="flex max-w-[calc(100vw-3rem)] flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-line-strong bg-raised/95 px-3.5 py-2.5 text-[12px] text-muted backdrop-blur">
            <span className="flex items-center gap-3">
              {(["locked", "open", "claimed", "in_progress", "done"] as TaskState[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm" style={{ background: STATE_HEX[s] }} />
                  {STATE_META[s].label}
                </span>
              ))}
            </span>
            <span className="hidden h-4 w-px bg-line-strong sm:block" />
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {blockStats.map(({ block, total, done, color }) => (
                <span key={block.id} className="flex items-center gap-1.5" title={block.name}>
                  <span className="size-2.5 rounded-full" style={{ background: color }} />
                  <span className="font-mono text-fg">{block.code}</span>
                  <span className="text-faint tabular-nums">
                    {done}/{total}
                  </span>
                </span>
              ))}
            </span>
          </div>
        </Panel>

        <Panel position="top-right">
          <button
            type="button"
            onClick={() => setFull((v) => !v)}
            className="flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-raised/95 px-3 text-[13px] font-medium text-muted backdrop-blur transition-colors hover:bg-hover hover:text-fg"
          >
            {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {full ? "Exit full screen" : "Full screen"}
          </button>
        </Panel>

        <Panel position="bottom-center">
          <p className="rounded-md bg-bg/70 px-2.5 py-1 text-[11px] text-faint backdrop-blur">
            Scroll to zoom · drag to pan · hover a task to trace its chain · click for details
          </p>
        </Panel>
      </ReactFlow>
    </div>
  );
}
