"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { BlockFormDialog } from "@/components/block-form";
import { ImportPanel } from "@/components/import-panel";
import { Avatar, StatusBadge } from "@/components/status";
import { TaskFormDialog } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/fields";
import { useBoard } from "@/lib/store";
import type { Block, Task } from "@/lib/types";
import { cn, naturalCompare } from "@/lib/utils";

type Tab = "tasks" | "blocks" | "import";

function TasksTab() {
  const board = useBoard();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...board.tasks]
      .filter((t) => !q || t.code.toLowerCase().includes(q) || t.title.toLowerCase().includes(q))
      .sort((a, b) => naturalCompare(a.code, b.code));
  }, [board.tasks, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-80">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" className={`${inputClass} h-9 pl-8`} />
        </div>
        <Button variant="primary" className="ml-auto" onClick={() => setCreating(true)} disabled={board.blocks.length === 0}>
          <Plus size={14} />
          New task
        </Button>
      </div>

      {board.blocks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-12 text-center text-[13px] text-muted">
          Create a block first, then add tasks to it. Or import a file in the last tab.
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-12 text-center text-[13px] text-muted">
          {board.tasks.length === 0 ? "No tasks yet." : "No tasks match your search."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <div className="hidden grid-cols-[4.5rem_1fr_9rem_6rem_9rem_2.5rem] gap-3 border-b border-line px-4 py-2 text-[11px] font-medium tracking-wider text-faint uppercase md:grid">
            <span>Code</span>
            <span>Title</span>
            <span>Owner</span>
            <span>Deps</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="divide-y divide-line">
            {rows.map((task) => {
              const owner = task.claimed_by ? board.memberById.get(task.claimed_by) : null;
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(task)}
                    className="grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-hover md:grid-cols-[4.5rem_1fr_9rem_6rem_9rem_2.5rem]"
                  >
                    <span className="font-mono text-[12px] text-muted">{task.code}</span>
                    <span className="truncate text-[13px] font-medium">{task.title}</span>
                    <span className="hidden items-center gap-2 md:flex">
                      {owner ? (
                        <>
                          <Avatar name={owner.name} size={20} />
                          <span className="truncate text-[12px] text-muted">{owner.name}</span>
                        </>
                      ) : (
                        <span className="text-[12px] text-faint">Unclaimed</span>
                      )}
                    </span>
                    <span className="hidden text-[12px] text-muted md:block">{board.depsOf.get(task.id)?.length ?? 0}</span>
                    <span>
                      <StatusBadge state={board.stateOf(task)} />
                    </span>
                    <span className="hidden justify-end text-faint md:flex">
                      <Pencil size={13} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <TaskFormDialog open={creating} onClose={() => setCreating(false)} />
      <TaskFormDialog open={Boolean(editing)} onClose={() => setEditing(null)} task={editing} />
    </div>
  );
}

function BlocksTab() {
  const board = useBoard();
  const [editing, setEditing] = useState<Block | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus size={14} />
          New block
        </Button>
      </div>

      {board.blocks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-12 text-center text-[13px] text-muted">No blocks yet.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
          {board.blocks.map((block, index) => {
            const count = board.tasksByBlock.get(block.id)?.length ?? 0;
            const confirming = confirmId === block.id;
            return (
              <li key={block.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-line-strong bg-raised font-mono text-[12px] font-medium">
                  {block.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{block.name}</p>
                  <p className="truncate text-[12px] text-faint">
                    {count} task{count === 1 ? "" : "s"}
                    {block.description ? ` · ${block.description}` : ""}
                  </p>
                </div>

                {confirming ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden text-[12px] text-muted sm:inline">
                      {count > 0 ? `Deletes ${count} task${count === 1 ? "" : "s"} too.` : "Delete this block?"}
                    </span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        await board.deleteBlock(block.id);
                        setConfirmId(null);
                      }}
                    >
                      Delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                      Keep
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => void board.moveBlock(block.id, -1)}
                      className={cn("rounded-md p-1.5 text-muted hover:bg-hover hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent")}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={index === board.blocks.length - 1}
                      onClick={() => void board.moveBlock(block.id, 1)}
                      className="rounded-md p-1.5 text-muted hover:bg-hover hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit block"
                      onClick={() => setEditing(block)}
                      className="rounded-md p-1.5 text-muted hover:bg-hover hover:text-fg"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete block"
                      onClick={() => setConfirmId(block.id)}
                      className="rounded-md p-1.5 text-muted hover:bg-hover hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <BlockFormDialog open={creating} onClose={() => setCreating(false)} />
      <BlockFormDialog open={Boolean(editing)} onClose={() => setEditing(null)} block={editing} />
    </div>
  );
}

export default function ManagePage() {
  const [tab, setTab] = useState<Tab>("tasks");
  const tabs: [Tab, string][] = [
    ["tasks", "Tasks"],
    ["blocks", "Blocks"],
    ["import", "Import & export"],
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold">Manage</h1>
        <p className="mt-1 text-[13px] text-muted">Create, edit and import blocks and tasks. Anyone can make changes here.</p>
      </div>

      <div role="tablist" className="flex gap-1 border-b border-line">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              tab === value ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "tasks" && <TasksTab />}
      {tab === "blocks" && <BlocksTab />}
      {tab === "import" && <ImportPanel />}
    </div>
  );
}
