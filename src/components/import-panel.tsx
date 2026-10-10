"use client";

import { useMemo, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, Download, FileUp } from "lucide-react";
import {
  TEMPLATE_CSV,
  TEMPLATE_JSON,
  buildPlan,
  downloadText,
  exportJson,
  parseInput,
  runImport,
  type ImportMode,
} from "@/lib/importer";
import { useBoard } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useToast } from "./toast";
import { Button } from "./ui/button";
import { inputClass } from "./ui/fields";

function Count({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div>
      <p className="text-[18px] leading-none font-semibold tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] text-muted">{label}</p>
      {sub && <p className="text-[11px] text-faint">{sub}</p>}
    </div>
  );
}

export function ImportPanel() {
  const board = useBoard();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  const existing = useMemo(
    () => ({ blocks: board.blocks, tasks: board.tasks, deps: board.deps }),
    [board.blocks, board.tasks, board.deps],
  );

  const plan = useMemo(() => {
    if (!text.trim()) return null;
    return buildPlan(parseInput(text), existing, mode);
  }, [text, existing, mode]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setText(await file.text());
    setFileName(file.name);
  }

  const canImport = plan && plan.errors.length === 0 && plan.tasks.length > 0 && (mode === "merge" || confirmed);

  async function run() {
    if (!plan || !canImport) return;
    setBusy(true);
    try {
      await runImport(plan, mode, existing, board.me?.id ?? null, setProgress);
      toast(`Imported ${plan.tasks.length} tasks`);
      setText("");
      setFileName(null);
      setConfirmed(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
      setProgress("");
      await board.refresh();
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        <section className="rounded-xl border border-line bg-panel p-5">
          <h2 className="text-[14px] font-semibold">Import tasks</h2>
          <p className="mt-1 text-[13px] text-muted">
            Upload a JSON or CSV file, or paste it below. Tasks are matched by code, so importing the same file again
            updates tasks instead of duplicating them. Claims and progress are never touched by a merge.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".json,.csv,.tsv,.txt,application/json,text/csv"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <Button onClick={() => fileRef.current?.click()}>
              <FileUp size={14} />
              Choose file
            </Button>
            {fileName && <span className="text-[12px] text-muted">{fileName}</span>}
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFileName(null);
            }}
            rows={10}
            spellCheck={false}
            placeholder="…or paste JSON, CSV, or rows copied from a spreadsheet"
            className={cn(inputClass, "mt-3 font-mono text-[12px] leading-relaxed")}
          />

          <fieldset className="mt-4 space-y-2">
            <legend className="mb-1 text-[12px] font-medium text-muted">When a task or block already exists</legend>
            {(
              [
                ["merge", "Merge", "Add new tasks and update existing ones by code. Everything else stays."],
                ["replace", "Replace everything", "Delete all current blocks, tasks, claims and history first."],
              ] as const
            ).map(([value, label, hint]) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors",
                  mode === value ? "border-line-strong bg-raised" : "border-line hover:bg-hover",
                )}
              >
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === value}
                  onChange={() => {
                    setMode(value);
                    setConfirmed(false);
                  }}
                  className="mt-1 accent-[#c5c9cf]"
                />
                <span>
                  <span className="block text-[13px] font-medium">{label}</span>
                  <span className="block text-[12px] text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {mode === "replace" && (
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13px] text-danger">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 accent-[#cf6b64]"
              />
              I understand this permanently deletes {board.tasks.length} existing tasks and all claims.
            </label>
          )}
        </section>

        {plan && (
          <section className="rounded-xl border border-line bg-panel p-5">
            <h2 className="text-[14px] font-semibold">Preview</h2>

            {plan.tasks.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                <Count label="New tasks" value={plan.stats.newTasks} />
                <Count label="Updated tasks" value={plan.stats.updatedTasks} />
                <Count label="Blocks" value={plan.blocks.length} sub={`${plan.stats.newBlocks} new`} />
                <Count label="Dependencies" value={plan.stats.dependencies} />
              </div>
            )}

            {plan.errors.length > 0 && (
              <div className="mt-4 rounded-lg border border-danger/30 bg-danger/6 p-3.5">
                <p className="flex items-center gap-2 text-[13px] font-medium text-danger">
                  <AlertCircle size={14} />
                  {plan.errors.length} problem{plan.errors.length > 1 ? "s" : ""} to fix before importing
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-muted">
                  {plan.errors.slice(0, 15).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                  {plan.errors.length > 15 && <li>…and {plan.errors.length - 15} more</li>}
                </ul>
              </div>
            )}

            {plan.warnings.length > 0 && (
              <div className="mt-3 rounded-lg border border-claimed/30 bg-claimed/6 p-3.5">
                <p className="flex items-center gap-2 text-[13px] font-medium text-claimed">
                  <AlertTriangle size={14} />
                  {plan.warnings.length} note{plan.warnings.length > 1 ? "s" : ""}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-muted">
                  {plan.warnings.slice(0, 10).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                  {plan.warnings.length > 10 && <li>…and {plan.warnings.length - 10} more</li>}
                </ul>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <Button variant="primary" disabled={!canImport} loading={busy} onClick={() => void run()}>
                Import {plan.tasks.length} task{plan.tasks.length === 1 ? "" : "s"}
              </Button>
              {busy && progress && <span className="text-[12px] text-muted">{progress}…</span>}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-line bg-panel p-5">
          <h2 className="text-[14px] font-semibold">Templates</h2>
          <p className="mt-1 text-[13px] text-muted">Start from a working example.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => downloadText("tasks-template.json", TEMPLATE_JSON, "application/json")}>
              <Download size={14} />
              JSON
            </Button>
            <Button onClick={() => downloadText("tasks-template.csv", TEMPLATE_CSV, "text/csv")}>
              <Download size={14} />
              CSV
            </Button>
          </div>
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-[13px] text-muted">Back up or move your current board.</p>
            <Button
              className="mt-3"
              disabled={board.tasks.length === 0}
              onClick={() => downloadText("task-board-export.json", exportJson(board.blocks, board.tasks, board.deps), "application/json")}
            >
              <Download size={14} />
              Export current
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-panel p-5 text-[13px] text-muted">
          <h2 className="text-[14px] font-semibold text-fg">Fields</h2>
          <dl className="mt-3 space-y-2.5">
            {[
              ["code", "Unique, e.g. A-01. Required."],
              ["title", "Required."],
              ["block", "Block code. Defaults to the part of the code before the dash."],
              ["block_name, block_description", "CSV only. Names a new block."],
              ["description, acceptance_criteria, notes", "Plain text. Lines starting with “- ” become bullets."],
              ["estimate", "Free text, e.g. 2h or 3 pts."],
              ["priority", "low, medium, high or critical."],
              ["tags", "Comma separated."],
              ["links", "“Label|https://…”, separated by semicolons."],
              ["depends_on", "Task codes and/or block codes, separated by commas or spaces. A block code means every task in that block."],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[12px] text-fg">{k}</dt>
                <dd className="text-[12px]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </aside>
    </div>
  );
}
