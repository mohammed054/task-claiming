// Backs up every table of the board to JSON files, using the same public key the website uses.
// No database password needed. Read-only: it never writes to your database.
// Run from your project folder:  node backup.mjs
import fs from "node:fs";

function readEnv() {
  const env = { ...process.env };
  for (const f of [".env.local", ".env"]) {
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const env = readEnv();
const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Could not find NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
  process.exit(1);
}

const tables = ["members", "blocks", "tasks", "task_dependencies", "claim_requests", "activity"];
const dir = `backup-${new Date().toISOString().slice(0, 10)}`;
fs.mkdirSync(dir, { recursive: true });

for (const t of tables) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${url}/rest/v1/${t}?select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 999}`, "Range-Unit": "items" },
    });
    if (!res.ok) {
      console.error(`FAILED on ${t}: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  fs.writeFileSync(`${dir}/${t}.json`, JSON.stringify(rows, null, 2));
  console.log(`${t}: ${rows.length} rows`);
}
console.log(`\nDone. Saved in the folder: ${dir}`);
