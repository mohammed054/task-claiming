"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useBoard } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "./status";
import { Button } from "./ui/button";
import { Modal } from "./ui/overlay";

export function useIncomingRequests() {
  const { pendingRequests, taskById, me } = useBoard();
  return pendingRequests.filter((r) => me && taskById.get(r.task_id)?.claimed_by === me.id);
}

export function RequestsDialog({
  open,
  onClose,
  onOpenTask,
}: {
  open: boolean;
  onClose: () => void;
  onOpenTask: (code: string) => void;
}) {
  const board = useBoard();
  const incoming = useIncomingRequests();
  const outgoing = board.pendingRequests.filter((r) => r.requester_id === board.me?.id);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function resolve(id: string, approve: boolean) {
    if (!board.me) return;
    setBusyId(id);
    await board.act(
      "resolve_request",
      { p_request: id, p_member: board.me.id, p_approve: approve },
      approve ? "Task handed over" : "Request declined",
    );
    setBusyId(null);
  }

  async function cancel(id: string) {
    if (!board.me) return;
    setBusyId(id);
    await board.act("cancel_request", { p_request: id, p_member: board.me.id }, "Request cancelled");
    setBusyId(null);
  }

  function openTask(code: string) {
    onOpenTask(code);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Claim requests" description="People asking to take over tasks.">
      <div className="space-y-6">
        <section>
          <h3 className="mb-2 text-[12px] font-medium tracking-wide text-muted uppercase">
            For you to answer{incoming.length > 0 && ` (${incoming.length})`}
          </h3>
          {incoming.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-[13px] text-faint">
              Nobody is waiting on you.
            </p>
          ) : (
            <ul className="space-y-2">
              {incoming.map((req) => {
                const task = board.taskById.get(req.task_id);
                const requester = board.memberById.get(req.requester_id);
                if (!task || !requester) return null;
                return (
                  <li key={req.id} className="rounded-lg border border-line bg-raised p-3.5">
                    <div className="flex items-start gap-3">
                      <Avatar name={requester.name} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px]">
                          <span className="font-medium">{requester.name}</span> wants to take over{" "}
                          <button
                            type="button"
                            onClick={() => openTask(task.code)}
                            className="font-mono text-[12px] text-fg underline decoration-line-strong underline-offset-2 hover:decoration-muted"
                          >
                            {task.code}
                          </button>{" "}
                          <span className="text-muted">{task.title}</span>
                        </p>
                        {req.message && (
                          <p className="mt-1.5 border-l-2 border-line-strong pl-2.5 text-[13px] text-muted">
                            {req.message}
                          </p>
                        )}
                        <p className="mt-1.5 text-[12px] text-faint">{timeAgo(req.created_at)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button size="sm" disabled={busyId === req.id} onClick={() => void resolve(req.id, false)}>
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        loading={busyId === req.id}
                        onClick={() => void resolve(req.id, true)}
                      >
                        Hand over
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {outgoing.length > 0 && (
          <section>
            <h3 className="mb-2 text-[12px] font-medium tracking-wide text-muted uppercase">Your requests</h3>
            <ul className="space-y-2">
              {outgoing.map((req) => {
                const task = board.taskById.get(req.task_id);
                const owner = task?.claimed_by ? board.memberById.get(task.claimed_by) : null;
                if (!task) return null;
                return (
                  <li
                    key={req.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-raised px-3.5 py-3"
                  >
                    <div className="min-w-0 text-[13px]">
                      <button
                        type="button"
                        onClick={() => openTask(task.code)}
                        className="inline-flex items-center gap-1.5 font-mono text-[12px] hover:underline"
                      >
                        {task.code}
                        <ArrowRight size={11} className="text-faint" />
                      </button>{" "}
                      <span className="text-muted">
                        waiting on <span className="text-fg">{owner?.name ?? "the owner"}</span> · {timeAgo(req.created_at)}
                      </span>
                    </div>
                    <Button size="sm" disabled={busyId === req.id} onClick={() => void cancel(req.id)}>
                      Cancel
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
