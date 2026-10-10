"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronsDownUp, ChevronsUpDown, GitBranch, List, Plus, Search } from "lucide-react";
import { TaskDrawer } from "@/components/task-drawer";
import { TaskFormDialog } from "@/components/task-form";
import { TaskGraph } from "@/components/task-graph";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { inputClass, selectClass } from "@/components/ui/fields";
import { useBoard } from "@/lib/store";
import { cn } from "@/lib/utils";

type View = "list" | "graph";
const VIEW_KEY = "task-board.view";

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

  const [view, setView] = useState<View>("list");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("any");
  const [blockFilter, setBlockFilter] = useState("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

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

  if (board.tasks.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
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

  return (
    <div className="space-y-5">
      {/* ---------------------------------------------------- overview */}
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

      {/* ---------------------------------------------------- toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="View" className="flex rounded-md border border-line-strong bg-panel p-0.5">
          {(
            [
              ["list", "List", List],
              ["graph", "Graph", GitBranch],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              onClick={() => changeView(value)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded px-3 text-[13px] font-medium transition-colors",
                view === value ? "bg-hover text-fg" : "text-muted hover:text-fg",
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-44 flex-1 sm:max-w-72">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            className={`${inputClass} h-9 pl-8`}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className={cn(selectClass, "h-9 w-auto")}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Owner" className={cn(selectClass, "h-9 w-auto")}>
          <option value="any">Any owner</option>
          <option value="me">My tasks</option>
          <option value="none">Unclaimed</option>
          {board.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={blockFilter}
          onChange={(e) => setBlockFilter(e.target.value)}
          aria-label="Block"
          className={cn(selectClass, "h-9 w-auto")}
        >
          <option value="all">All blocks</option>
          {board.blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.code} · {b.name}
            </option>
          ))}
        </select>

        {filtering && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {view === "list" && !filtering && (
            <Button
              variant="ghost"
              onClick={() => setCollapsed(collapsed.size ? new Set() : new Set(board.blocks.map((b) => b.id)))}
            >
              {collapsed.size ? <ChevronsUpDown size={14} /> : <ChevronsDownUp size={14} />}
              {collapsed.size ? "Expand all" : "Collapse all"}
            </Button>
          )}
          <Button onClick={() => setCreating(true)}>
            <Plus size={14} />
            New task
          </Button>
        </div>
      </div>

      {filtering && (
        <p className="text-[12px] text-muted">
          Showing {matched.size} of {board.tasks.length} tasks
          {view === "graph" && " (others are dimmed)"}
        </p>
      )}

      {/* ---------------------------------------------------- content */}
      {view === "list" ? (
        <TaskList matched={matched} filtering={filtering} collapsed={collapsed} onToggle={toggleBlock} onOpen={openTask} />
      ) : (
        <TaskGraph matched={matched} selectedId={selected?.id ?? null} onOpen={openTask} />
      )}

      <TaskDrawer task={selected} onClose={closeTask} onOpenTask={openTask} />
      <TaskFormDialog open={creating} onClose={() => setCreating(false)} />
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
