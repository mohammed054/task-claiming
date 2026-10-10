"use client";

import { useState, type ReactNode } from "react";
import { ExternalLink, Lock, Pencil, X } from "lucide-react";
import { describeActivity } from "@/lib/activity";
import { useBoard } from "@/lib/store";
import type { Task } from "@/lib/types";
import { formatDateTime, safeHref, timeAgo } from "@/lib/utils";
import { Markdown } from "./markdown";
import { Avatar, PriorityMark, StatusBadge } from "./status";
import { TaskFormDialog } from "./task-form";
import { Button } from "./ui/button";
import { inputClass } from "./ui/fields";
import { Drawer } from "./ui/overlay";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-medium tracking-wider text-faint uppercase">{title}</h3>
      {children}
    </section>
  );
}

function TaskLinkRow({ task, onOpen }: { task: Task; onOpen: (code: string) => void }) {
  const board = useBoard();
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(task.code)}
        className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-hover"
      >
        <span className="w-12 shrink-0 font-mono text-[12px] text-muted">{task.code}</span>
        <span className="min-w-0 flex-1 truncate text-[13px]">{task.title}</span>
        <StatusBadge state={board.stateOf(task)} />
      </button>
    </li>
  );
}

function Body({ task, onClose, onOpenTask }: { task: Task; onClose: () => void; onOpenTask: (code: string) => void }) {
  const board = useBoard();
  const me = board.me!;
  const [busy, setBusy] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  const state = board.stateOf(task);
  const owner = task.claimed_by ? board.memberById.get(task.claimed_by) : null;
  const mine = owner?.id === me.id;
  const held = task.status === "claimed" || task.status === "in_progress";
  const unmet = board.unmetDeps(task);
  const requests = board.requestsByTask.get(task.id) ?? [];
  const myRequest = requests.find((r) => r.requester_id === me.id);
  const block = board.blockById.get(task.block_id);

  const dependsOn = (board.depsOf.get(task.id) ?? [])
    .map((id) => board.taskById.get(id))
    .filter((t): t is Task => Boolean(t))
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  const unlocks = (board.dependentsOf.get(task.id) ?? [])
    .map((id) => board.taskById.get(id))
    .filter((t): t is Task => Boolean(t))
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  const history = board.activity.filter((a) => a.task_id === task.id).slice(0, 12);

  async function run(key: string, fn: string, success: string, extra: Record<string, unknown> = {}) {
    setBusy(key);
    const ok = await board.act(fn, { p_task: task.id, p_member: me.id, ...extra }, success);
    setBusy(null);
    return ok;
  }

  async function sendRequest() {
    const ok = await run("request", "request_claim", "Request sent", { p_message: message });
    if (ok) {
      setAsking(false);
      setMessage("");
    }
  }

  async function resolve(id: string, approve: boolean) {
    setBusy(id);
    await board.act(
      "resolve_request",
      { p_request: id, p_member: me.id, p_approve: approve },
      approve ? "Task handed over" : "Request declined",
    );
    setBusy(null);
  }

  return (
    <>
      <div className="border-b border-line px-5 pt-4 pb-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-[12px] text-muted">
            <span className="rounded border border-line-strong bg-raised px-1.5 py-0.5 font-mono text-fg">{task.code}</span>
            {block && (
              <span className="truncate">
                Block {block.code} · {block.name}
              </span>
            )}
          </div>
          <div className="-mr-1.5 flex items-center">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit task"
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-fg"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-hover hover:text-fg"
            >
              <X size={17} />
            </button>
          </div>
        </div>
        <h2 className="text-[18px] leading-snug font-semibold">{task.title}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusBadge state={state} />
          <PriorityMark priority={task.priority} />
          {task.estimate && <span className="text-[12px] text-muted">Estimate {task.estimate}</span>}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* ------------------------------------------------ action panel */}
        <div className="rounded-lg border border-line-strong bg-raised p-4">
          {state === "locked" && (
            <>
              <div className="flex items-center gap-2 text-[13px] font-medium">
                <Lock size={14} className="text-faint" />
                Awaiting {unmet.length} {unmet.length === 1 ? "task" : "tasks"}
              </div>
              <p className="mt-1 text-[13px] text-muted">
                This unlocks once {unmet.map((t) => t.code).join(", ")} {unmet.length === 1 ? "is" : "are"} done.
              </p>
              <Button variant="primary" className="mt-3" disabled>
                <Lock size={13} />
                Claim task
              </Button>
            </>
          )}

          {state === "open" && (
            <>
              <p className="text-[13px] text-muted">Nobody has this task. Claim it to start working.</p>
              <Button
                variant="primary"
                className="mt-3"
                loading={busy === "claim"}
                onClick={() => void run("claim", "claim_task", `Claimed ${task.code}`)}
              >
                Claim this task
              </Button>
            </>
          )}

          {mine && held && (
            <>
              <p className="text-[13px] text-muted">
                You hold this task{task.claimed_at ? ` since ${timeAgo(task.claimed_at)}` : ""}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {task.status === "claimed" && (
                  <Button loading={busy === "start"} onClick={() => void run("start", "start_task", "Marked in progress")}>
                    Start work
                  </Button>
                )}
                <Button
                  variant="primary"
                  loading={busy === "complete"}
                  onClick={() => void run("complete", "complete_task", `${task.code} is done`)}
                >
                  Mark done
                </Button>
                <Button
                  variant="ghost"
                  loading={busy === "release"}
                  onClick={() => void run("release", "release_task", `Released ${task.code}`)}
                >
                  Release
                </Button>
              </div>
            </>
          )}

          {mine && task.status === "done" && (
            <>
              <p className="text-[13px] text-muted">
                You completed this{task.completed_at ? ` ${timeAgo(task.completed_at)}` : ""}.
              </p>
              <Button
                className="mt-3"
                loading={busy === "reopen"}
                onClick={() => void run("reopen", "reopen_task", `Reopened ${task.code}`)}
              >
                Reopen
              </Button>
            </>
          )}

          {!mine && owner && held && (
            <>
              <div className="flex items-center gap-2.5">
                <Avatar name={owner.name} size={26} />
                <p className="text-[13px]">
                  <span className="font-medium">{owner.name}</span>{" "}
                  <span className="text-muted">
                    {task.status === "in_progress" ? "is working on this" : "claimed this"}
                    {task.claimed_at ? ` ${timeAgo(task.claimed_at)}` : ""}
                  </span>
                </p>
              </div>

              {myRequest ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-claimed/25 bg-claimed/8 px-3 py-2">
                  <span className="text-[13px] text-claimed">Your request is waiting for {owner.name}.</span>
                  <Button
                    size="sm"
                    loading={busy === myRequest.id}
                    onClick={async () => {
                      setBusy(myRequest.id);
                      await board.act("cancel_request", { p_request: myRequest.id, p_member: me.id }, "Request cancelled");
                      setBusy(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : asking ? (
                <div className="mt-3 space-y-2.5">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    autoFocus
                    maxLength={500}
                    placeholder={`Tell ${owner.name} why you'd like to take this over (optional)`}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" loading={busy === "request"} onClick={() => void sendRequest()}>
                      Send request
                    </Button>
                    <Button variant="ghost" onClick={() => setAsking(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-2.5 text-[13px] text-muted">
                    You can&apos;t claim a task someone else holds, but you can ask them for it.
                  </p>
                  <Button className="mt-3" onClick={() => setAsking(true)}>
                    Request to claim
                  </Button>
                </>
              )}
            </>
          )}

          {!mine && owner && task.status === "done" && (
            <div className="flex items-center gap-2.5">
              <Avatar name={owner.name} size={26} />
              <p className="text-[13px]">
                <span className="font-medium">{owner.name}</span>{" "}
                <span className="text-muted">
                  completed this{task.completed_at ? ` ${timeAgo(task.completed_at)}` : ""}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------ requests for the owner */}
        {mine && requests.length > 0 && (
          <Section title={`Requests to take over (${requests.length})`}>
            <ul className="space-y-2">
              {requests.map((req) => {
                const requester = board.memberById.get(req.requester_id);
                if (!requester) return null;
                return (
                  <li key={req.id} className="rounded-lg border border-claimed/25 bg-claimed/6 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <Avatar name={requester.name} size={26} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px]">
                          <span className="font-medium">{requester.name}</span>{" "}
                          <span className="text-faint">· {timeAgo(req.created_at)}</span>
                        </p>
                        {req.message && <p className="mt-1 text-[13px] text-muted">{req.message}</p>}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button size="sm" disabled={busy === req.id} onClick={() => void resolve(req.id, false)}>
                        Decline
                      </Button>
                      <Button size="sm" variant="primary" loading={busy === req.id} onClick={() => void resolve(req.id, true)}>
                        Hand over
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* ------------------------------------------------ details */}
        <Section title="Description">
          {task.description ? <Markdown text={task.description} /> : <p className="text-[13px] text-faint">No description.</p>}
        </Section>

        {task.acceptance_criteria && (
          <Section title="Acceptance criteria">
            <Markdown text={task.acceptance_criteria} />
          </Section>
        )}

        {task.notes && (
          <Section title="Notes">
            <Markdown text={task.notes} />
          </Section>
        )}

        {task.links.length > 0 && (
          <Section title="Links">
            <ul className="space-y-1.5">
              {task.links.map((link, i) => {
                const href = safeHref(link.url);
                return (
                  <li key={i} className="text-[13px]">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-fg underline decoration-line-strong underline-offset-2 hover:decoration-muted"
                      >
                        {link.label || link.url}
                        <ExternalLink size={12} className="text-faint" />
                      </a>
                    ) : (
                      <span className="text-muted">{link.label || link.url}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {task.tags.length > 0 && (
          <Section title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-line-strong bg-raised px-2 py-0.5 text-[12px] text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </Section>
        )}

        <Section title={`Depends on (${dependsOn.length})`}>
          {dependsOn.length === 0 ? (
            <p className="text-[13px] text-faint">Nothing. This task can start right away.</p>
          ) : (
            <ul className="-mx-2.5">
              {dependsOn.map((t) => (
                <TaskLinkRow key={t.id} task={t} onOpen={onOpenTask} />
              ))}
            </ul>
          )}
        </Section>

        <Section title={`Unlocks (${unlocks.length})`}>
          {unlocks.length === 0 ? (
            <p className="text-[13px] text-faint">No tasks are waiting on this one.</p>
          ) : (
            <ul className="-mx-2.5">
              {unlocks.map((t) => (
                <TaskLinkRow key={t.id} task={t} onOpen={onOpenTask} />
              ))}
            </ul>
          )}
        </Section>

        <Section title="History">
          {history.length === 0 ? (
            <p className="text-[13px] text-faint">Nothing has happened to this task yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {history.map((a) => {
                const actor = a.member_id ? board.memberById.get(a.member_id)?.name : null;
                const { before, after } = describeActivity(a, board.memberById);
                return (
                  <li key={a.id} className="flex items-baseline justify-between gap-4 text-[13px]">
                    <span className="text-muted">
                      <span className="font-medium text-fg">{actor ?? "Someone"}</span> {before}this task{after}
                    </span>
                    <span className="shrink-0 text-[12px] text-faint" title={formatDateTime(a.created_at)}>
                      {timeAgo(a.created_at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>

      <TaskFormDialog open={editing} onClose={() => setEditing(false)} task={task} />
    </>
  );
}

export function TaskDrawer({
  task,
  onClose,
  onOpenTask,
}: {
  task: Task | null;
  onClose: () => void;
  onOpenTask: (code: string) => void;
}) {
  const board = useBoard();
  return (
    <Drawer open={Boolean(task) && Boolean(board.me)} onClose={onClose} label={task ? `Task ${task.code}` : "Task"}>
      {/* key resets local form state when switching between tasks */}
      {task && board.me && <Body key={task.id} task={task} onClose={onClose} onOpenTask={onOpenTask} />}
    </Drawer>
  );
}
