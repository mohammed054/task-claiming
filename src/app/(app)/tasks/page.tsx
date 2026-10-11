"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronsDownUp, ChevronsUpDown, GitBranch, List, Plus, Search, X } from "lucide-react";
import { TaskDrawer } from "@/components/task-drawer";
import { TaskFormDialog } from "@/components/task-form";
import { TaskGraph } from "@/components/task-graph";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { inputClass, selectClass } from "@/components/ui/fields";
import { useBoard } from "@/lib/store";
import { cn } from "@/lib/utils";

type View = "list" | "graph";
const VIEW_KEY = "task-board.view.v2";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available now" },
  { value: "locked", label: "Awaiting" },
  { value: "claimed", label: "Claimed" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <p className="text-[20px] leading-none font-semibold tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] text-muted">{label}</p>
    </div>
  );
}

function TasksView() {
  const board = useBoard();
  const router = useRouter();
  const params = useSearchParams();

  const [view, setView] = useState<View>("graph");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("any");
  const [blockFilter, setBlockFilter] = useState("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [barH, setBarH] = useState(56);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "list" || saved === "graph") setView(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function changeView(next: View) {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const selectedCode = params.get("task");
  const selected = selectedCode ? (board.taskByCode.get(selectedCode) ?? null) : null;

  const openTask = useCallback(
    (code: string) => router.push(`/tasks?task=${encodeURIComponent(code)}`, { scroll: false }),
    [router],
  );
  const closeTask = useCallback(() => router.push("/tasks", { scroll: false }), [router]);

  const filtering = Boolean(query.trim()) || status !== "all" || owner !== "any" || blockFilter !== "all";

  const matched = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ids = new Set<string>();
    for (const task of board.tasks) {
      const state = board.stateOf(task);
      if (blockFilter !== "all" && task.block_id !== blockFilter) continue;
      if (status === "available" && state !== "open") continue;
      if (status !== "all" && status !== "available" && state !== status) continue;
      if (owner === "me" && task.claimed_by !== board.me?.id) continue;
      if (owner === "none" && task.claimed_by) continue;
      if (owner !== "any" && owner !== "me" && owner !== "none" && task.claimed_by !== owner) continue;
      if (q) {
        const haystack = `${task.code} ${task.title} ${task.description} ${task.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) continue;
      }
      ids.add(task.id);
    }
    return ids;
  }, [board, query, status, owner, blockFilter]);

  const counts = useMemo(() => {
    const c = { total: board.tasks.length, available: 0, locked: 0, active: 0, done: 0 };
    for (const task of board.tasks) {
      const s = board.stateOf(task);
      if (s === "open") c.available++;
      else if (s === "locked") c.locked++;
      else if (s === "done") c.done++;
      else c.active++;
    }
    return c;
  }, [board]);

  const percent = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;

  function toggleBlock(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setOwner("any");
    setBlockFilter("all");
  }

  const graph = view === "graph";

  // the floating bar's height tells the graph how much room to leave at the top
  useEffect(() => {
    const el = barRef.current;
    if (!graph || !el) return;
    const ro = new ResizeObserver(() => setBarH(Math.round(el.getBoundingClientRect().height)));
    ro.observe(el);
    setBarH(Math.round(el.getBoundingClientRect().height));
    return () => ro.disconnect();
  }, [graph]);

  if (board.tasks.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-[17px] font-semibold">No tasks yet</h1>
        <p className="mt-2 text-[13px] text-muted">
          Import your full list from a JSON or CSV file, or create blocks and tasks by hand.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href="/manage"
            className="inline-flex h-9 items-center rounded-md bg-fg px-3.5 text-[13px] font-medium text-bg hover:bg-white"
          >
            Open Manage
          </Link>
        </div>
      </div>
    );
  }

  const compactSelect = cn(selectClass, "h-8 w-auto! rounded-lg border-white/10 bg-white/[0.04] py-0 pl-2.5 text-[12.5px] hover:bg-white/[0.07]");

  const toolbar = (
    <div
      ref={barRef}
      className={cn(
        "flex flex-wrap items-center gap-x-2.5 gap-y-2",
        graph &&
          "rounded-2xl border border-white/10 bg-[#0a0c11]/80 px-2.5 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl",
      )}
    >
      <div role="tablist" aria-label="View" className="flex rounded-lg border border-white/10 bg-white/[0.04] p-0.5">
        {(
          [
            ["graph", "Tree", GitBranch],
            ["list", "List", List],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() => changeView(value)}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-colors",
              view === value ? "bg-white/10 text-fg shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <div className="relative min-w-36 flex-1 sm:max-w-60">
        <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks"
          className={cn(inputClass, "h-8 rounded-lg border-white/10 bg-white/[0.04] py-0 pl-8 text-[12.5px]")}
        />
      </div>

      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className={compactSelect}>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Owner" className={compactSelect}>
        <option value="any">Any owner</option>
        <option value="me">My tasks</option>
        <option value="none">Unclaimed</option>
        {board.members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} aria-label="Block" className={compactSelect}>
        <option value="all">All blocks</option>
        {board.blocks.map((b) => (
          <option key={b.id} value={b.id}>
            {b.code} · {b.name}
          </option>
        ))}
      </select>

      {filtering && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-claimed/10 px-2.5 text-[12.5px] font-medium text-claimed transition-colors hover:bg-claimed/20"
        >
          <span className="tabular-nums">
            {matched.size}/{board.tasks.length}
          </span>
          <X size={12} />
        </button>
      )}

      <div className="ml-auto flex items-center gap-3">
        {graph && (
          <div className="hidden items-center gap-4 text-[12px] text-muted lg:flex">
            <span><b className="font-semibold text-fg tabular-nums">{counts.total}</b> tasks</span>
            <span><b className="font-semibold text-fg tabular-nums">{counts.available}</b> open</span>
            <span><b className="font-semibold text-fg tabular-nums">{counts.active}</b> live</span>
            <span><b className="font-semibold text-fg tabular-nums">{counts.locked}</b> awaiting</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-done to-progress transition-all"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <b className="font-semibold text-fg tabular-nums">{percent}%</b>
            </span>
          </div>
        )}
        {!graph && !filtering && (
          <Button
            variant="ghost"
            onClick={() => setCollapsed(collapsed.size ? new Set() : new Set(board.blocks.map((b) => b.id)))}
          >
            {collapsed.size ? <ChevronsUpDown size={14} /> : <ChevronsDownUp size={14} />}
            {collapsed.size ? "Expand all" : "Collapse all"}
          </Button>
        )}
        <Button variant="primary" onClick={() => setCreating(true)} className="h-8 rounded-lg px-3 text-[12.5px]">
          <Plus size={13} />
          New task
        </Button>
      </div>
    </div>
  );

  const overlays = (
    <>
      <TaskDrawer task={selected} onClose={closeTask} onOpenTask={openTask} />
      <TaskFormDialog open={creating} onClose={() => setCreating(false)} />
    </>
  );

  // ------------------------------------------------------------- tree: the whole page is the map
  if (graph) {
    return (
      <div className="relative h-[calc(100dvh-3.5rem)] min-h-[480px] w-full overflow-hidden">
        <TaskGraph
          matched={matched}
          selectedId={selected?.id ?? null}
          onOpen={openTask}
          filtering={filtering}
          insetTop={barH + 12}
          blockFilter={blockFilter}
          onPickBlock={setBlockFilter}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3">
          <div className="pointer-events-auto mx-auto max-w-[1700px]">{toolbar}</div>
        </div>
        {overlays}
      </div>
    );
  }

  // ------------------------------------------------------------- list
  return (
    <div className="mx-auto w-full max-w-[2000px] space-y-5 px-4 py-6 sm:px-6">
      <section className="rounded-xl border border-line bg-panel p-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-5">
          <Stat label="Total tasks" value={counts.total} />
          <Stat label="Available now" value={counts.available} />
          <Stat label="In flight" value={counts.active} />
          <Stat label="Awaiting" value={counts.locked} />
          <Stat label="Done" value={counts.done} />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-done transition-all" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-[12px] text-muted tabular-nums">{percent}% complete</span>
        </div>
      </section>

      {toolbar}

      {filtering && (
        <p className="text-[12px] text-muted">
          Showing {matched.size} of {board.tasks.length} tasks
        </p>
      )}

      <TaskList matched={matched} filtering={filtering} collapsed={collapsed} onToggle={toggleBlock} onOpen={openTask} />
      {overlays}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksView />
    </Suspense>
  );
}
