"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/status";
import { Button } from "@/components/ui/button";
import { describeActivity } from "@/lib/activity";
import { useBoard } from "@/lib/store";
import { formatDateTime, timeAgo } from "@/lib/utils";

const PAGE = 50;

export default function ActivityPage() {
  const board = useBoard();
  const [shown, setShown] = useState(PAGE);
  const items = board.activity.slice(0, shown);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold">Activity</h1>
        <p className="mt-1 text-[13px] text-muted">Everything that has happened on the board, newest first.</p>
      </div>

      {board.activity.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-[13px] text-muted">
          Nothing yet. Claim a task to get things started.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-panel">
          <ul className="divide-y divide-line">
            {items.map((a) => {
              const actor = a.member_id ? board.memberById.get(a.member_id)?.name : null;
              const task = a.task_id ? board.taskById.get(a.task_id) : null;
              const { before, after } = describeActivity(a, board.memberById);
              const deletedCode = typeof a.detail?.code === "string" ? a.detail.code : null;
              const importedCount = typeof a.detail?.tasks === "number" ? a.detail.tasks : null;

              let target: React.ReactNode;
              if (task) {
                target = (
                  <Link
                    href={`/tasks?task=${encodeURIComponent(task.code)}`}
                    className="font-mono text-[12px] text-fg underline decoration-line-strong underline-offset-2 hover:decoration-muted"
                  >
                    {task.code}
                  </Link>
                );
              } else if (a.action === "deleted" && deletedCode) {
                target = <span className="font-mono text-[12px] text-fg">{deletedCode}</span>;
              } else if (a.action === "imported") {
                target = <span className="text-fg">{importedCount ?? "some"} tasks</span>;
              } else {
                target = <span className="text-faint">a removed task</span>;
              }

              return (
                <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={actor ?? "?"} size={26} />
                  <p className="min-w-0 flex-1 text-[13px] text-muted">
                    <span className="font-medium text-fg">{actor ?? "Someone"}</span> {before}
                    {target}
                    {after}
                    {task && <span className="hidden text-faint sm:inline"> · {task.title}</span>}
                  </p>
                  <span className="shrink-0 text-[12px] text-faint" title={formatDateTime(a.created_at)}>
                    {timeAgo(a.created_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {board.activity.length > shown && (
        <div className="flex justify-center">
          <Button onClick={() => setShown((n) => n + PAGE)}>Show more</Button>
        </div>
      )}
    </div>
  );
}
