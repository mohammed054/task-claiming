import Papa from "papaparse";
import { supabase } from "./supabase";
import type { Block, Dependency, Priority, Task, TaskLink } from "./types";
import { naturalCompare } from "./utils";

export type ImportMode = "merge" | "replace";

export interface ParsedBlock {
  code: string;
  name?: string;
  description?: string;
}

export interface ParsedTask {
  code: string;
  block: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  estimate: string;
  priority: Priority;
  tags: string[];
  links: TaskLink[];
  notes: string;
  /** task codes and/or block codes, exactly as written in the file */
  depends_on: string[];
}

export interface ImportPlan {
  blocks: ParsedBlock[];
  tasks: ParsedTask[];
  /** task code -> task codes it depends on, after block references are expanded */
  resolvedDeps: Map<string, string[]>;
  errors: string[];
  warnings: string[];
  stats: {
    newBlocks: number;
    updatedBlocks: number;
    newTasks: number;
    updatedTasks: number;
    dependencies: number;
  };
}

type Raw = Record<string, unknown>;

const CODE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

const pick = (o: Raw, ...keys: string[]): unknown => {
  for (const key of keys) {
    const v = o[key];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};
const str = (v: unknown): string => (v === undefined || v === null ? "" : String(v).trim());

function toTokens(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(str).filter(Boolean);
  return str(v)
    .split(/[\s,;|]+/)
    .filter(Boolean);
}

function toTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(str).filter(Boolean);
  return str(v)
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toLinks(v: unknown): TaskLink[] {
  const items: unknown[] = Array.isArray(v) ? v : str(v).split(/[;\n]+/);
  const out: TaskLink[] = [];
  for (const item of items) {
    if (item && typeof item === "object") {
      const o = item as Raw;
      const url = str(o.url ?? o.href ?? o.link);
      if (url) out.push({ label: str(o.label ?? o.title ?? o.name) || url, url });
    } else {
      const text = str(item);
      if (!text) continue;
      const [first, ...rest] = text.split("|").map((s) => s.trim());
      out.push(rest.length ? { label: first, url: rest.join("|") } : { label: first, url: first });
    }
  }
  return out;
}

function normalizeTask(o: Raw, index: number, errors: string[], warnings: string[]): ParsedTask | null {
  const code = str(pick(o, "code", "id", "task", "task_code"));
  if (!code) {
    errors.push(`Task ${index + 1}: missing a code`);
    return null;
  }
  if (!CODE_RE.test(code)) errors.push(`${code}: codes may only use letters, numbers, dots, dashes and underscores`);

  const title = str(pick(o, "title", "name", "task_name"));
  if (!title) errors.push(`${code}: missing a title`);

  const block = str(pick(o, "block", "block_code")) || (code.includes("-") ? code.split("-")[0] : "");
  if (!block) errors.push(`${code}: missing a block (add a "block" field or use a code like A-01)`);

  const rawPriority = str(pick(o, "priority")).toLowerCase();
  let priority: Priority = "medium";
  if (rawPriority) {
    if ((PRIORITIES as string[]).includes(rawPriority)) priority = rawPriority as Priority;
    else warnings.push(`${code}: unknown priority “${rawPriority}”, using medium`);
  }

  return {
    code,
    block,
    title,
    description: str(pick(o, "description", "details")),
    acceptance_criteria: str(pick(o, "acceptance_criteria", "acceptanceCriteria", "criteria")),
    estimate: str(pick(o, "estimate", "effort")),
    priority,
    tags: toTags(pick(o, "tags", "labels")),
    links: toLinks(pick(o, "links", "link", "urls")),
    notes: str(pick(o, "notes")),
    depends_on: toTokens(pick(o, "depends_on", "dependsOn", "dependencies", "depends")),
  };
}

export interface RawImport {
  blocks: ParsedBlock[];
  tasks: ParsedTask[];
  errors: string[];
  warnings: string[];
}

function parseJson(text: string): RawImport {
  const errors: string[] = [];
  const warnings: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { blocks: [], tasks: [], errors: [`This is not valid JSON: ${(e as Error).message}`], warnings };
  }

  const rawTasks = Array.isArray(data) ? data : (data as Raw)?.tasks;
  const rawBlocks = Array.isArray(data) ? [] : (data as Raw)?.blocks;
  if (!Array.isArray(rawTasks)) {
    return { blocks: [], tasks: [], errors: ['Expected a "tasks" array (or a top-level array of tasks).'], warnings };
  }

  const blocks: ParsedBlock[] = [];
  if (Array.isArray(rawBlocks)) {
    rawBlocks.forEach((b, i) => {
      const o = (b ?? {}) as Raw;
      const code = str(pick(o, "code", "id"));
      if (!code) {
        errors.push(`Block ${i + 1}: missing a code`);
        return;
      }
      blocks.push({ code, name: str(pick(o, "name", "title")) || undefined, description: str(o.description) || undefined });
    });
  }

  const tasks: ParsedTask[] = [];
  rawTasks.forEach((t, i) => {
    const parsed = normalizeTask((t ?? {}) as Raw, i, errors, warnings);
    if (parsed) tasks.push(parsed);
  });
  return { blocks, tasks, errors, warnings };
}

function parseCsv(text: string): RawImport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const result = Papa.parse<Raw>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });
  for (const err of result.errors.slice(0, 5)) {
    if (err.code === "TooFewFields" || err.code === "TooManyFields") continue;
    errors.push(`CSV row ${(err.row ?? 0) + 2}: ${err.message}`);
  }

  const blocks = new Map<string, ParsedBlock>();
  const tasks: ParsedTask[] = [];
  result.data.forEach((row, i) => {
    const parsed = normalizeTask(row, i, errors, warnings);
    if (!parsed) return;
    tasks.push(parsed);
    const blockName = str(row.block_name);
    const blockDescription = str(row.block_description);
    const existing = blocks.get(parsed.block);
    if (!existing) {
      blocks.set(parsed.block, {
        code: parsed.block,
        name: blockName || undefined,
        description: blockDescription || undefined,
      });
    } else {
      existing.name ||= blockName || undefined;
      existing.description ||= blockDescription || undefined;
    }
  });
  return { blocks: [...blocks.values()], tasks, errors, warnings };
}

export function parseInput(text: string): RawImport {
  const trimmed = text.trim();
  if (!trimmed) return { blocks: [], tasks: [], errors: [], warnings: [] };
  return trimmed.startsWith("{") || trimmed.startsWith("[") ? parseJson(trimmed) : parseCsv(trimmed);
}

interface Existing {
  blocks: Block[];
  tasks: Task[];
  deps: Dependency[];
}

export function buildPlan(raw: RawImport, existing: Existing, mode: ImportMode): ImportPlan {
  const errors = [...raw.errors];
  const warnings = [...raw.warnings];

  // duplicate codes inside the file
  const seen = new Set<string>();
  const tasks: ParsedTask[] = [];
  for (const t of raw.tasks) {
    if (seen.has(t.code)) {
      errors.push(`${t.code}: appears more than once in the file`);
      continue;
    }
    seen.add(t.code);
    tasks.push(t);
  }

  const existingBlocks = mode === "replace" ? [] : existing.blocks;
  const existingTasks = mode === "replace" ? [] : existing.tasks;
  const existingBlockCodes = new Set(existingBlocks.map((b) => b.code));
  const existingTaskCodes = new Set(existingTasks.map((t) => t.code));

  // blocks: explicit ones plus any referenced by a task
  const blockMap = new Map<string, ParsedBlock>();
  for (const b of raw.blocks) blockMap.set(b.code, b);
  for (const t of tasks) if (t.block && !blockMap.has(t.block)) blockMap.set(t.block, { code: t.block });
  const blocks = [...blockMap.values()];

  // which tasks belong to which block (existing + imported), for block-level dependencies
  const blockTasks = new Map<string, Set<string>>();
  const addToBlock = (block: string, code: string) => {
    const set = blockTasks.get(block) ?? new Set<string>();
    set.add(code);
    blockTasks.set(block, set);
  };
  const existingBlockById = new Map(existing.blocks.map((b) => [b.id, b]));
  for (const t of existingTasks) {
    const b = existingBlockById.get(t.block_id);
    if (b) addToBlock(b.code, t.code);
  }
  for (const t of tasks) {
    // an imported task may move an existing task to another block
    for (const set of blockTasks.values()) set.delete(t.code);
  }
  for (const t of tasks) if (t.block) addToBlock(t.block, t.code);

  const allTaskCodes = new Set([...existingTaskCodes, ...tasks.map((t) => t.code)]);
  const allBlockCodes = new Set([...existingBlockCodes, ...blockMap.keys()]);
  const lowerTask = new Map([...allTaskCodes].map((c) => [c.toLowerCase(), c]));
  const lowerBlock = new Map([...allBlockCodes].map((c) => [c.toLowerCase(), c]));

  // resolve dependencies
  const resolvedDeps = new Map<string, string[]>();
  for (const t of tasks) {
    const out = new Set<string>();
    for (const token of t.depends_on) {
      const asTask = allTaskCodes.has(token) ? token : lowerTask.get(token.toLowerCase());
      if (asTask) {
        if (asTask === t.code) warnings.push(`${t.code}: depends on itself, ignored`);
        else out.add(asTask);
        continue;
      }
      const asBlock = allBlockCodes.has(token) ? token : lowerBlock.get(token.toLowerCase());
      if (asBlock) {
        const members = [...(blockTasks.get(asBlock) ?? [])].filter((c) => c !== t.code);
        if (members.length === 0) warnings.push(`${t.code}: block ${asBlock} has no tasks to wait for`);
        members.forEach((c) => out.add(c));
        continue;
      }
      errors.push(`${t.code}: depends on “${token}”, which is not a known task or block`);
    }
    resolvedDeps.set(t.code, [...out].sort(naturalCompare));
  }

  // cycle check on the final graph
  const graph = new Map<string, string[]>();
  const existingCodeById = new Map(existing.tasks.map((t) => [t.id, t.code]));
  if (mode === "merge") {
    for (const d of existing.deps) {
      const from = existingCodeById.get(d.task_id);
      const to = existingCodeById.get(d.depends_on_id);
      if (from && to && !seen.has(from)) graph.set(from, [...(graph.get(from) ?? []), to]);
    }
  }
  for (const [code, deps] of resolvedDeps) graph.set(code, deps);

  const state = new Map<string, 1 | 2>();
  const stack: string[] = [];
  let cycle: string[] | null = null;
  const visit = (node: string) => {
    if (cycle) return;
    state.set(node, 1);
    stack.push(node);
    for (const next of graph.get(node) ?? []) {
      if (state.get(next) === 1) {
        cycle = [...stack.slice(stack.indexOf(next)), next];
        return;
      }
      if (!state.has(next)) visit(next);
      if (cycle) return;
    }
    stack.pop();
    state.set(node, 2);
  };
  for (const node of graph.keys()) {
    if (!state.has(node)) visit(node);
    if (cycle) break;
  }
  if (cycle) errors.push(`Dependency loop: ${(cycle as string[]).join(" → ")}`);

  if (tasks.length === 0 && raw.errors.length === 0 && raw.blocks.length === 0) {
    errors.push("No tasks found in this input.");
  }

  const importedBlockCodes = new Set(blocks.map((b) => b.code));
  return {
    blocks,
    tasks,
    resolvedDeps,
    errors,
    warnings,
    stats: {
      newBlocks: blocks.filter((b) => !existingBlockCodes.has(b.code)).length,
      updatedBlocks: [...importedBlockCodes].filter((c) => existingBlockCodes.has(c)).length,
      newTasks: tasks.filter((t) => !existingTaskCodes.has(t.code)).length,
      updatedTasks: tasks.filter((t) => existingTaskCodes.has(t.code)).length,
      dependencies: [...resolvedDeps.values()].reduce((n, list) => n + list.length, 0),
    },
  };
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

function check(error: { message: string } | null, step: string) {
  if (error) throw new Error(`${step}: ${error.message}`);
}

export async function runImport(
  plan: ImportPlan,
  mode: ImportMode,
  existing: Existing,
  memberId: string | null,
  onProgress?: (message: string) => void,
): Promise<void> {
  if (mode === "replace") {
    onProgress?.("Clearing existing data");
    const { error } = await supabase.from("blocks").delete().not("id", "is", null);
    check(error, "Clearing blocks");
  }
  const existingBlocks = mode === "replace" ? [] : existing.blocks;
  const existingByCode = new Map(existingBlocks.map((b) => [b.code, b]));
  const maxPosition = existingBlocks.reduce((m, b) => Math.max(m, b.position), 0);

  onProgress?.("Saving blocks");
  let nextPosition = maxPosition;
  const blockRows = plan.blocks.map((b) => {
    const current = existingByCode.get(b.code);
    return {
      code: b.code,
      name: b.name ?? current?.name ?? b.code,
      description: b.description ?? current?.description ?? "",
      position: current?.position ?? ++nextPosition,
    };
  });
  for (const rows of chunk(blockRows, 200)) {
    const { error } = await supabase.from("blocks").upsert(rows, { onConflict: "code" });
    check(error, "Saving blocks");
  }

  const { data: blockData, error: blockError } = await supabase.from("blocks").select("id, code");
  check(blockError, "Reading blocks");
  const blockIdByCode = new Map((blockData ?? []).map((b) => [b.code as string, b.id as string]));

  onProgress?.(`Saving ${plan.tasks.length} tasks`);
  const taskRows = plan.tasks.map((t, i) => ({
    block_id: blockIdByCode.get(t.block),
    code: t.code,
    title: t.title,
    description: t.description,
    acceptance_criteria: t.acceptance_criteria,
    estimate: t.estimate,
    priority: t.priority,
    tags: t.tags,
    links: t.links,
    notes: t.notes,
    position: i + 1,
  }));
  for (const rows of chunk(taskRows, 200)) {
    const { error } = await supabase.from("tasks").upsert(rows, { onConflict: "code" });
    check(error, "Saving tasks");
  }

  const idByCode = new Map<string, string>();
  for (const codes of chunk(
    [...new Set([...plan.tasks.map((t) => t.code), ...[...plan.resolvedDeps.values()].flat()])],
    150,
  )) {
    const { data, error } = await supabase.from("tasks").select("id, code").in("code", codes);
    check(error, "Reading tasks");
    for (const row of data ?? []) idByCode.set(row.code as string, row.id as string);
  }

  onProgress?.("Linking dependencies");
  const importedIds = plan.tasks.map((t) => idByCode.get(t.code)).filter((id): id is string => Boolean(id));
  for (const ids of chunk(importedIds, 100)) {
    const { error } = await supabase.from("task_dependencies").delete().in("task_id", ids);
    check(error, "Clearing old dependencies");
  }
  const depRows: { task_id: string; depends_on_id: string }[] = [];
  for (const [code, deps] of plan.resolvedDeps) {
    const taskId = idByCode.get(code);
    if (!taskId) continue;
    for (const dep of deps) {
      const depId = idByCode.get(dep);
      if (depId) depRows.push({ task_id: taskId, depends_on_id: depId });
    }
  }
  for (const rows of chunk(depRows, 500)) {
    const { error } = await supabase.from("task_dependencies").insert(rows);
    check(error, "Saving dependencies");
  }

  await supabase.from("activity").insert({
    member_id: memberId,
    action: "imported",
    detail: { tasks: plan.tasks.length, blocks: plan.blocks.length },
  });
}

// ---------------------------------------------------------------- templates and export

export const TEMPLATE_JSON = JSON.stringify(
  {
    blocks: [
      { code: "A", name: "Foundation", description: "Repository, tooling and conventions." },
      { code: "B", name: "Backend", description: "Data model and services." },
    ],
    tasks: [
      {
        code: "A-01",
        block: "A",
        title: "Folder structure",
        description: "Lay out the top-level folders.\n- apps\n- packages\n- docs",
        acceptance_criteria: "- Layout is documented in the README",
        estimate: "1h",
        priority: "high",
        tags: ["setup"],
        links: [{ label: "Conventions", url: "https://example.com/conventions" }],
        notes: "",
        depends_on: [],
      },
      {
        code: "A-02",
        block: "A",
        title: "package.json",
        description: "Root package.json with scripts.",
        acceptance_criteria: "- npm install and npm run build both pass",
        estimate: "1h",
        priority: "high",
        tags: ["setup"],
        links: [],
        notes: "",
        depends_on: ["A-01"],
      },
      {
        code: "B-01",
        block: "B",
        title: "Database schema",
        description: "Design and migrate the core tables.",
        acceptance_criteria: "",
        estimate: "4h",
        priority: "critical",
        tags: ["database"],
        links: [],
        notes: "Depending on a whole block (\"A\") means every task in that block must be done.",
        depends_on: ["A"],
      },
    ],
  },
  null,
  2,
);

export const TEMPLATE_CSV = Papa.unparse(
  [
    {
      block: "A",
      block_name: "Foundation",
      block_description: "Repository, tooling and conventions.",
      code: "A-01",
      title: "Folder structure",
      description: "Lay out the top-level folders.",
      acceptance_criteria: "- Layout is documented in the README",
      estimate: "1h",
      priority: "high",
      tags: "setup",
      links: "Conventions|https://example.com/conventions",
      notes: "",
      depends_on: "",
    },
    {
      block: "A",
      block_name: "",
      block_description: "",
      code: "A-02",
      title: "package.json",
      description: "Root package.json with scripts.",
      acceptance_criteria: "- npm install and npm run build both pass",
      estimate: "1h",
      priority: "high",
      tags: "setup",
      links: "",
      notes: "",
      depends_on: "A-01",
    },
    {
      block: "B",
      block_name: "Backend",
      block_description: "Data model and services.",
      code: "B-01",
      title: "Database schema",
      description: "Design and migrate the core tables.",
      acceptance_criteria: "",
      estimate: "4h",
      priority: "critical",
      tags: "database",
      links: "",
      notes: "",
      depends_on: "A",
    },
  ],
  { newline: "\n" },
);

export function exportJson(blocks: Block[], tasks: Task[], deps: Dependency[]): string {
  const codeById = new Map(tasks.map((t) => [t.id, t.code]));
  const blockById = new Map(blocks.map((b) => [b.id, b]));
  const depsOf = new Map<string, string[]>();
  for (const d of deps) {
    const to = codeById.get(d.depends_on_id);
    if (to) depsOf.set(d.task_id, [...(depsOf.get(d.task_id) ?? []), to]);
  }
  return JSON.stringify(
    {
      blocks: blocks.map((b) => ({ code: b.code, name: b.name, description: b.description })),
      tasks: [...tasks]
        .sort((a, b) => naturalCompare(a.code, b.code))
        .map((t) => ({
          code: t.code,
          block: blockById.get(t.block_id)?.code ?? "",
          title: t.title,
          description: t.description,
          acceptance_criteria: t.acceptance_criteria,
          estimate: t.estimate,
          priority: t.priority,
          tags: t.tags,
          links: t.links,
          notes: t.notes,
          depends_on: (depsOf.get(t.id) ?? []).sort(naturalCompare),
        })),
    },
    null,
    2,
  );
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
