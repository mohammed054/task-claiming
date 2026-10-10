# Task Board

A shared board for a big build. Work is split into **blocks** (A, B, C…), each holding many **tasks** (A-01, A-02…).
Tasks can depend on other tasks. A task whose dependencies are not all done stays visible but dimmed, marked
*Awaiting*, and cannot be claimed until they are.

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Realtime).

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment** – copy `.env.local.example` to `.env.local` and fill in both values
   (Supabase → Project Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

3. **Database** – run the migrations in order, either by pasting each file into the Supabase **SQL Editor**, or with the CLI
   (`supabase link` then `supabase db push`):

   | File | What it does |
   | --- | --- |
   | `supabase/migrations/0001_schema.sql` | Tables, rules, actions (claim, release, …), open access policies, realtime |
   | `supabase/migrations/0002_seed_placeholder.sql` | Optional sample blocks A–D with 12 tasks. Skip it if you will import your own list straight away |

4. **Run**

   ```bash
   npm run dev      # http://localhost:3000
   ```

   `npm run build` produces a static site in `out/` (no Node server needed). See **Deploying** below.

## How it works

- **Sign in** – pick an existing name or add a new one. No password. The browser remembers you; use the menu in the
  top right to switch user.
- **Tasks** – list view (collapsible blocks with progress) or graph view (dependency map). Filter by status, owner,
  block, or search. Click any task to open its full details.
- **Claiming** – a task can be claimed by one person. Others can send a **request** (with a message); the owner approves
  (the task is handed over) or declines, from the inbox icon in the header or from the task itself.
- **Statuses** – Open → Claimed → In progress → Done, plus *Awaiting* (computed: open but a dependency is unfinished).
  Only the owner can start, finish, release or reopen a task. Reopening a finished task locks the tasks that depend on it again.
- **Live** – changes show up for everyone within a moment (Supabase Realtime, with a refresh on focus as a fallback).
- **Activity** – a log of every claim, release, hand-over, completion and import.
- **Manage** – create, edit and delete blocks and tasks, and import or export the whole board.

## Importing your task list

Manage → **Import & export**. Upload or paste JSON or CSV (rows pasted from a spreadsheet work too). You get a preview and a list of
any problems before anything is written. Download the templates there to start from a working example.

- Tasks are matched by `code`, so importing again **updates** instead of duplicating. A merge never touches who has
  claimed what or any progress.
- `depends_on` takes task codes and/or block codes separated by commas or spaces. A block code means *every task currently in
  that block*.
- Dependency loops, unknown dependencies, duplicate codes and missing titles are caught in the preview.
- **Export current** downloads the board in the same JSON format, handy for backups.

Fields: `code`, `title`, `block`, `description`, `acceptance_criteria`, `estimate`, `priority` (`low|medium|high|critical`),
`tags`, `links` (`Label|https://…`), `notes`, `depends_on`. CSV can also include `block_name` and `block_description`.

## Things to know

- **There is no authentication.** The database policies allow anyone with the site URL (and the public key) to read and write.
  That matches "no passwords", but keep the deployment URL internal. If you later need real access control, add Supabase
  Auth and tighten the policies in a new migration.
- State changes (claim, release, start, complete, reopen, request, hand over) run as database functions that lock the row, so two
  people clicking at the same moment cannot both win.
- To wipe the placeholder data: Manage → Import & export → choose **Replace everything** when you import, or
  delete the blocks one by one in Manage → Blocks.

## Deploying (GitHub Pages + Supabase)

The site is a static export hosted on GitHub Pages; the database, realtime and API are Supabase.

1. Push this project to a GitHub repo (branch `main`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. **Settings → Secrets and variables → Actions → Variables** – add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://isvulfzcmkzdqphkalch.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your `sb_publishable_...` key
   - (optional) `CUSTOM_DOMAIN` = any value if you serve from your own domain at `/`
4. Push to `main`. `.github/workflows/deploy.yml` type-checks, builds and publishes. The URL appears in the run summary
   (`https://<user>.github.io/<repo>/`).

### Database migrations from GitHub (optional)

`.github/workflows/supabase-migrations.yml` runs `supabase db push` when you start it manually (Actions → Run workflow).
Add under **Secrets**: `SUPABASE_ACCESS_TOKEN` (Account → Access Tokens) and `SUPABASE_DB_PASSWORD`; under **Variables**:
`SUPABASE_PROJECT_REF` = `isvulfzcmkzdqphkalch`.
If you already ran `0001`/`0002` in the SQL Editor, tick **baseline** on the first run so they are not applied twice.
Future schema changes go in new files such as `supabase/migrations/0003_….sql`.

**Never** put the `sb_secret_...` key in the repo, the variables above, or frontend code. The browser only needs the publishable key.
