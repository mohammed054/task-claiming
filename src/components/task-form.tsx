"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useBoard } from "@/lib/store";
import type { Priority, Task } from "@/lib/types";
import { cn, linksToText, naturalCompare, splitList, textToLinks } from "@/lib/utils";
import { Button } from "./ui/button";
import { Field, inputClass, selectClass } from "./ui/fields";
import { Modal } from "./ui/overlay";

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];
const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function suggestCode(blockCode: string, existing: Task[]): string {
  const prefix = `${blockCode}-`;
  let max = 0;
  for (const t of existing) {
    if (t.code.startsWith(prefix)) {
      const n = parseInt(t.code.slice(prefix.length), 10);
      if (Number.isFinite(n)) max = Math.max(max, n);
    }
  }
  return `${prefix}${String(max + 1).padStart(2, "0")}`;
}

function Inner({
  task,
  defaultBlockId,
  onClose,
}: {
  task: Task | null;
  defaultBlockId?: string;
  onClose: () => void;
}) {
  const board = useBoard();
  const editing = Boolean(task);

  const firstBlock = defaultBlockId ?? board.blocks[0]?.id ?? "";
  const [blockId, setBlockId] = useState(task?.block_id ?? firstBlock);
  const [code, setCode] = useState(
    task?.code ??
      suggestCode(
        board.blockById.get(firstBlock)?.code ?? "T",
        board.tasksByBlock.get(firstBlock) ?? [],
      ),
  );
  const [codeTouched, setCodeTouched] = useState(editing);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [criteria, setCriteria] = useState(task?.acceptance_criteria ?? "");
  const [estimate, setEstimate] = useState(task?.estimate ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [tags, setTags] = useState((task?.tags ?? []).join(", "));
  const [links, setLinks] = useState(linksToText(task?.links ?? []));
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [deps, setDeps] = useState<Set<string>>(new Set(task ? (board.depsOf.get(task.id) ?? []) : []));
  const [depQuery, setDepQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // tasks that (directly or not) depend on this one cannot become its dependencies
  const blocked = useMemo(() => {
    const out = new Set<string>();
    if (!task) return out;
    const stack = [task.id];
    while (stack.length) {
      const id = stack.pop()!;
      for (const next of board.dependentsOf.get(id) ?? []) {
        if (!out.has(next)) {
          out.add(next);
          stack.push(next);
        }
      }
    }
    return out;
  }, [task, board.dependentsOf]);

  const candidates = useMemo(() => {
    const q = depQuery.trim().toLowerCase();
    return board.tasks
      .filter((t) => t.id !== task?.id && !blocked.has(t.id))
      .filter((t) => !q || t.code.toLowerCase().includes(q) || t.title.toLowerCase().includes(q))
      .sort((a, b) => naturalCompare(a.code, b.code));
  }, [board.tasks, task, blocked, depQuery]);

  function changeBlock(id: string) {
    setBlockId(id);
    if (!codeTouched && !editing) {
      setCode(suggestCode(board.blockById.get(id)?.code ?? "T", board.tasksByBlock.get(id) ?? []));
    }
  }

  function toggleDep(id: string) {
    setDeps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const codeValue = code.trim();
  const codeError = !codeValue
    ? "Required"
    : !CODE_PATTERN.test(codeValue)
      ? "Use letters, numbers, dots, dashes and underscores only"
      : null;
  const valid = !codeError && title.trim() && blockId;

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    const ok = await board.saveTask(
      {
        block_id: blockId,
        code: codeValue,
        title: title.trim(),
        description: description.trim(),
        acceptance_criteria: criteria.trim(),
        estimate: estimate.trim(),
        priority,
        tags: splitList(tags),
        links: textToLinks(links),
        notes: notes.trim(),
      },
      [...deps],
      task?.id,
    );
    setSaving(false);
    if (ok) onClose();
  }

  async function remove() {
    if (!task) return;
    setSaving(true);
    const ok = await board.deleteTask(task.id);
    setSaving(false);
    if (ok) onClose();
  }

  const holder = task?.claimed_by ? board.memberById.get(task.claimed_by)?.name : null;

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? `Edit ${task!.code}` : "New task"}
      className="max-w-2xl"
      footer={
        <>
          {editing && (
            <div className="mr-auto">
              {confirmDelete ? (
                <span className="flex items-center gap-2">
                  <span className="text-[12px] text-muted">
                    {holder ? `${holder} holds this task. ` : ""}Delete permanently?
                  </span>
                  <Button size="sm" variant="danger" loading={saving} onClick={() => void remove()}>
                    Yes, delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Keep
                  </Button>
                </span>
              ) : (
                <Button size="sm" variant="ghost" className="text-danger hover:text-danger" onClick={() => setConfirmDelete(true)}>
                  Delete task
                </Button>
              )}
            </div>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} disabled={!valid} onClick={() => void save()}>
            {editing ? "Save changes" : "Create task"}
          </Button>
        </>
      }
    >
      {board.blocks.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">Create a block first, then add tasks to it.</p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
            <Field label="Block">
              <select value={blockId} onChange={(e) => changeBlock(e.target.value)} className={selectClass}>
                {board.blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} · {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Code" hint={codeError && codeValue ? codeError : undefined}>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeTouched(true);
                }}
                className={cn(inputClass, "font-mono")}
              />
            </Field>
          </div>

          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} autoFocus={!editing} />
          </Field>

          <Field label="Description" hint="Supports bullet lists, **bold** and `code`.">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} />
          </Field>

          <Field label="Acceptance criteria" hint="One criterion per line, starting with “- ”.">
            <textarea value={criteria} onChange={(e) => setCriteria(e.target.value)} rows={3} className={inputClass} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Priority">
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={selectClass}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estimate">
              <input value={estimate} onChange={(e) => setEstimate(e.target.value)} placeholder="2h, 3 pts…" className={inputClass} />
            </Field>
            <Field label="Tags">
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="api, database" className={inputClass} />
            </Field>
          </div>

          <Field label="Links" hint="One per line. Use “Label | https://…” or just a URL.">
            <textarea value={links} onChange={(e) => setLinks(e.target.value)} rows={2} className={cn(inputClass, "font-mono text-[12px]")} />
          </Field>

          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
          </Field>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12px] font-medium text-muted">Depends on</span>
              <span className="text-[12px] text-faint">{deps.size} selected</span>
            </div>
            <div className="rounded-md border border-line-strong bg-panel">
              <div className="relative border-b border-line">
                <Search size={13} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
                <input
                  value={depQuery}
                  onChange={(e) => setDepQuery(e.target.value)}
                  placeholder="Search tasks"
                  className="w-full bg-transparent py-2 pr-3 pl-8 text-[13px] placeholder:text-faint focus-visible:outline-none"
                />
              </div>
              <ul className="max-h-48 overflow-y-auto py-1">
                {candidates.length === 0 && <li className="px-3 py-3 text-[12px] text-faint">No matching tasks.</li>}
                {candidates.map((t) => (
                  <li key={t.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 hover:bg-hover">
                      <input
                        type="checkbox"
                        checked={deps.has(t.id)}
                        onChange={() => toggleDep(t.id)}
                        className="size-3.5 accent-[#c5c9cf]"
                      />
                      <span className="w-12 shrink-0 font-mono text-[12px] text-muted">{t.code}</span>
                      <span className="truncate text-[13px]">{t.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-1.5 text-[12px] text-faint">
              This task stays locked until every selected task is done.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function TaskFormDialog({
  open,
  onClose,
  task = null,
  defaultBlockId,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultBlockId?: string;
}) {
  if (!open) return null;
  return <Inner key={task?.id ?? "new"} task={task} defaultBlockId={defaultBlockId} onClose={onClose} />;
}
