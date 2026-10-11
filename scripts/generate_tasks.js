const fs = require("fs");
const path = require("path");

const blockFnd = require("./definitions/block-fnd");
const blockBeCore = require("./definitions/block-be-core");
const blockBeOps = require("./definitions/block-be-ops");
const blockBeEdge = require("./definitions/block-be-edge");
const blockUik = require("./definitions/block-uik");
const blockPub = require("./definitions/block-pub");
const blockStuCore = require("./definitions/block-stu-core");
const blockStuGam = require("./definitions/block-stu-gam");
const blockTchCore = require("./definitions/block-tch-core");
const blockTchAi = require("./definitions/block-tch-ai");
const blockAdm = require("./definitions/block-adm");

const blocks = [
  blockFnd.block,
  blockBeCore.block,
  blockBeOps.block,
  blockBeEdge.block,
  blockUik.block,
  blockPub.block,
  blockStuCore.block,
  blockStuGam.block,
  blockTchCore.block,
  blockTchAi.block,
  blockAdm.block,
];

const allTasks = [
  ...blockFnd.tasks,
  ...blockBeCore.tasks,
  ...blockBeOps.tasks,
  ...blockBeEdge.tasks,
  ...blockUik.tasks,
  ...blockPub.tasks,
  ...blockStuCore.tasks,
  ...blockStuGam.tasks,
  ...blockTchCore.tasks,
  ...blockTchAi.tasks,
  ...blockAdm.tasks,
];

console.log("Total Blocks:", blocks.length);
console.log("Total Tasks:", allTasks.length);

// 1. Validation & DAG Cycle Check
function validateDataset(blocksList, tasksList) {
  const errors = [];
  const warnings = [];
  const blockCodes = new Set(blocksList.map((b) => b.code));
  const taskMap = new Map();
  const blockTasks = new Map();

  for (const b of blocksList) {
    if (!b.code || !b.name) errors.push(`Block missing code or name: ${JSON.stringify(b)}`);
    blockTasks.set(b.code, new Set());
  }

  for (const t of tasksList) {
    if (!t.code) errors.push(`Task missing code: ${JSON.stringify(t)}`);
    if (taskMap.has(t.code)) errors.push(`Duplicate task code: ${t.code}`);
    taskMap.set(t.code, t);

    if (!blockCodes.has(t.block)) errors.push(`Task ${t.code} has unknown block: ${t.block}`);
    else blockTasks.get(t.block).add(t.code);

    if (!t.title) errors.push(`${t.code} missing title`);
    if (!t.description) errors.push(`${t.code} missing description`);
    if (!t.acceptance_criteria) errors.push(`${t.code} missing acceptance_criteria`);
    if (!["1h", "2h"].includes(t.estimate)) warnings.push(`${t.code} estimate is ${t.estimate}`);
    if (!["low", "medium", "high", "critical"].includes(t.priority))
      errors.push(`${t.code} invalid priority ${t.priority}`);
  }

  // Resolve dependencies
  const graph = new Map();
  for (const t of tasksList) {
    const resolved = new Set();
    for (const dep of t.depends_on || []) {
      if (taskMap.has(dep)) {
        if (dep === t.code) errors.push(`${t.code} depends on itself`);
        resolved.add(dep);
      } else if (blockCodes.has(dep)) {
        const members = blockTasks.get(dep);
        for (const m of members) {
          if (m !== t.code) resolved.add(m);
        }
      } else {
        errors.push(`${t.code} depends on unknown token: "${dep}"`);
      }
    }
    graph.set(t.code, Array.from(resolved));
  }

  // Cycle check using DFS
  const state = new Map(); // 1 = visiting, 2 = visited
  const stack = [];
  let cycle = null;

  function visit(node) {
    if (cycle) return;
    state.set(node, 1);
    stack.push(node);
    for (const next of graph.get(node) || []) {
      if (state.get(next) === 1) {
        cycle = [...stack.slice(stack.indexOf(next)), next];
        return;
      }
      if (!state.has(next)) visit(next);
      if (cycle) return;
    }
    stack.pop();
    state.set(node, 2);
  }

  for (const node of graph.keys()) {
    if (!state.has(node)) visit(node);
    if (cycle) break;
  }

  if (cycle) errors.push(`Cycle detected: ${cycle.join(" -> ")}`);

  return { errors, warnings, totalTasks: tasksList.length, totalBlocks: blocksList.length, graph };
}

const validation = validateDataset(blocks, allTasks);
if (validation.errors.length > 0) {
  console.error("Validation failed with errors:");
  validation.errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log("Validation passed! Zero errors. Warnings:", validation.warnings.length);

// 2. Generate public/tasks.json
const dataset = {
  blocks: blocks.map((b) => ({
    code: b.code,
    name: b.name,
    description: b.description,
  })),
  tasks: allTasks.map((t) => ({
    code: t.code,
    block: t.block,
    title: t.title,
    description: t.description,
    acceptance_criteria: t.acceptance_criteria,
    estimate: t.estimate,
    priority: t.priority,
    tags: t.tags,
    links: t.links,
    notes: t.notes || "",
    depends_on: t.depends_on,
  })),
};

const tasksJsonPath = path.resolve(__dirname, "../public/tasks.json");
fs.writeFileSync(tasksJsonPath, JSON.stringify(dataset, null, 2), "utf8");
console.log("Generated:", tasksJsonPath, `(${fs.statSync(tasksJsonPath).size} bytes)`);

// 3. Generate supabase/migrations/0002_seed_placeholder.sql
function escapeSqlString(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function escapeSqlTextWithE(str) {
  if (!str) return "''";
  // Use E'...' syntax for strings with newlines and escapes
  const escaped = str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");
  return `E'${escaped}'`;
}

function formatTagsArray(tags) {
  if (!tags || tags.length === 0) return "array[]::text[]";
  const escaped = tags.map((t) => `'${t.replace(/'/g, "''")}'`).join(", ");
  return `array[${escaped}]::text[]`;
}

function formatLinksJsonb(links) {
  if (!links || links.length === 0) return "'[]'::jsonb";
  const jsonStr = JSON.stringify(links).replace(/'/g, "''");
  return `'${jsonStr}'::jsonb`;
}

let sql = `-- Migration 0002: Real Seed Data for Al Hikmah English Platform
-- Replaces initial placeholder blocks and tasks with the complete, production-grade micro-task DAG.

-- Clean out existing placeholder data
DELETE FROM task_dependencies;
DELETE FROM tasks;
DELETE FROM blocks;

-- 1. Insert Blocks
INSERT INTO blocks (code, name, description, position) VALUES
`;

const blockValues = blocks.map(
  (b, i) =>
    `  (${escapeSqlString(b.code)}, ${escapeSqlString(b.name)}, ${escapeSqlString(b.description)}, ${i + 1})`
);
sql += blockValues.join(",\n") + ";\n\n";

// 2. Insert Tasks
sql += `-- 2. Insert Tasks
INSERT INTO tasks (block_id, code, title, description, acceptance_criteria, estimate, priority, tags, links, position)
SELECT b.id, v.code, v.title, v.description, v.criteria, v.estimate, v.priority, v.tags, v.links, v.position
FROM (VALUES
`;

const taskValues = allTasks.map((t, i) => {
  return `  (${escapeSqlString(t.block)}, ${escapeSqlString(t.code)}, ${escapeSqlString(t.title)}, ${escapeSqlTextWithE(t.description)}, ${escapeSqlTextWithE(t.acceptance_criteria)}, ${escapeSqlString(t.estimate)}, ${escapeSqlString(t.priority)}::priority, ${formatTagsArray(t.tags)}, ${formatLinksJsonb(t.links)}, ${i + 1})`;
});
sql += taskValues.join(",\n") + "\n) AS v(block_code, code, title, description, criteria, estimate, priority, tags, links, position)\nJOIN blocks b ON b.code = v.block_code;\n\n";

// 3. Insert Task Dependencies
sql += `-- 3. Insert Task Dependencies (Fully Resolved DAG)
INSERT INTO task_dependencies (task_id, depends_on_id)
SELECT t.id, d.id
FROM (VALUES
`;

const depPairs = [];
for (const [taskCode, deps] of validation.graph.entries()) {
  for (const depCode of deps) {
    depPairs.push(`  (${escapeSqlString(taskCode)}, ${escapeSqlString(depCode)})`);
  }
}

if (depPairs.length > 0) {
  sql += depPairs.join(",\n") + "\n) AS v(task_code, dep_code)\nJOIN tasks t ON t.code = v.task_code\nJOIN tasks d ON d.code = v.dep_code;\n";
} else {
  sql += "  (NULL, NULL)\n) AS v(task_code, dep_code) WHERE v.task_code IS NOT NULL;\n";
}

const sqlPath = path.resolve(__dirname, "../supabase/migrations/0002_seed_placeholder.sql");
fs.writeFileSync(sqlPath, sql, "utf8");
console.log("Generated:", sqlPath, `(${fs.statSync(sqlPath).size} bytes, ${depPairs.length} dependencies)`);
