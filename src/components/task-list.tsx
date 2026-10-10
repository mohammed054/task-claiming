"use client";

import { ChevronDown, Lock } from "lucide-react";
import { useBoard } from "@/lib/store";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, PriorityMark, STATE_META, StatusBadge } from "./status";

function TaskRow({ task, onOpen }: { task: Task; onOpen: (code: string) => void }) {
  const board = useBoard();
  const state = board.stateOf(task);
  const locked = state === "locked";
  const owner = task.claimed_by ? board.memberById.get(task.claimed_by) : null;
  const mine = owner?.id === board.me?.id;
  const unmet = locked ? board.unmetDeps(task) : [];
  const requestCount = board.requestsByTask.get(task.id)?.length ?? 0;
  const Icon = STATE_META[state].icon;

  return (
    <button
      type="button"
      onClick={() => onOpen(task.code)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-hover",
        locked && "opacity-50 hover:opacity-80",
      )}
    >
      <Icon size={15} className={cn("shrink-0", STATE_META[state].text)} />

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2.5">
          <span className="w-12 shrink-0 font-mono text-[12px] text-muted">{task.code}</span>
          <span className="truncate text-[13.5px] font-medium">{task.title}</span>
        </span>
        {(locked || requestCount > 0) && (
          <span className="mt-0.5 flex items-center gap-3 pl-[3.625rem] text-[12px] text-faint">
            {locked && (
              <span className="flex items-center gap-1 truncate">
                <Lock size={11} className="shrink-0" />
                Awaiting {unmet.map((t) => t.code).join(", ")}
              </span>
            )}
            {requestCount > 0 && (
              <span className="text-claimed">
                {requestCount} claim request{requestCount > 1 ? "s" : ""}
              </span>
            )}
          </span>
        )}
      </span>

      <span className="hidden w-24 shrink-0 md:block">
        <PriorityMark priority={task.priority} />
      </span>
      <span className="hidden w-14 shrink-0 text-right text-[12px] text-muted lg:block">{task.estimate || "–"}</span>
      <span className="hidden w-32 shrink-0 items-center gap-2 sm:flex">
        {owner ? (
          <>
            <Avatar name={owner.name} size={20} />
            <span className={cn("truncate text-[12px]", mine ? "font-medium text-fg" : "text-muted")}>
              {mine ? "You" : owner.name}
            </span>
          </>
        ) : (
          <span className="text-[12px] text-faint">Unclaimed</span>
        )}
      </span>
      <span className="flex w-[104px] shrink-0 justify-end">
        <StatusBadge state={state} />
      </span>
    </button>
  );
}

export function TaskList({
  matched,
  filtering,
  collapsed,
  onToggle,
  onOpen,
}: {
  matched: Set<string>;
  filtering: boolean;
  collapsed: Set<string>;
  onToggle: (blockId: string) => void;
  onOpen: (code: string) => void;
}) {
  const board = useBoard();

  const sections = board.blocks
    .map((block) => {
      const all = board.tasksByBlock.get(block.id) ?? [];
      return { block, all, shown: all.filter((t) => matched.has(t.id)) };
    })
    .filter((s) => !filtering || s.shown.length > 0);

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line py-16 text-center text-[13px] text-muted">
        No tasks match these filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(({ block, all, shown }) => {
        const done = all.filter((t) => t.status === "done").length;
        const percent = all.length ? Math.round((done / all.length) * 100) : 0;
        const isCollapsed = collapsed.has(block.id) && !filtering;

        return (
          <section key={block.id} className="overflow-hidden rounded-xl border border-line bg-panel">
            <button
              type="button"
              onClick={() => onToggle(block.id)}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-hover"
            >
              <ChevronDown
                size={15}
                className={cn("shrink-0 text-faint transition-transform", isCollapsed && "-rotate-90")}
              />
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-line-strong bg-raised font-mono text-[12px] font-medium">
                {block.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{block.name}</span>
                {block.description && (
                  <span className="hidden truncate text-[12px] text-faint sm:block">{block.description}</span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-[12px] text-muted tabular-nums">
                  {done}/{all.length}
                </span>
                <span className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-line sm:block">
                  <span className="block h-full rounded-full bg-done transition-all" style={{ width: `${percent}%` }} />
                </span>
              </span>
            </button>

            {!isCollapsed &&
              (shown.length === 0 ? (
                <p className="border-t border-line px-4 py-4 text-[13px] text-faint">No tasks in this block yet.</p>
              ) : (
                <div className="divide-y divide-line border-t border-line">
                  {shown.map((task) => (
                    <TaskRow key={task.id} task={task} onOpen={onOpen} />
                  ))}
                </div>
              ))}
          </section>
        );
      })}
    </div>
  );
}
