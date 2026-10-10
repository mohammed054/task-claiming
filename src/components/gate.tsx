"use client";

import type { ReactNode } from "react";
import { AlertTriangle, DatabaseZap, Loader2 } from "lucide-react";
import { useBoard } from "@/lib/store";
import { Button } from "./ui/button";

function Message({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-start justify-center px-6">
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-line-strong bg-raised text-muted">
        {icon}
      </div>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="mt-2 space-y-3 text-[13px] leading-relaxed text-muted">{children}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const code = "rounded bg-raised px-1.5 py-0.5 font-mono text-[12px] text-fg";

/** Renders its children only once data has loaded; otherwise explains what is missing. */
export function Gate({ children }: { children: ReactNode }) {
  const board = useBoard();

  if (!board.configured) {
    return (
      <Message icon={<AlertTriangle size={18} />} title="Supabase is not configured">
        <p>
          Add these two variables to <span className={code}>.env.local</span> (and to your hosting provider), then restart
          the dev server:
        </p>
        <pre className="overflow-x-auto rounded-md border border-line bg-panel p-3 font-mono text-[12px] text-fg">
          {"NEXT_PUBLIC_SUPABASE_URL=...\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=..."}
        </pre>
      </Message>
    );
  }

  if (board.loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        <Loader2 size={18} className="animate-spin" />
      </div>
    );
  }

  if (board.setupNeeded) {
    return (
      <Message
        icon={<DatabaseZap size={18} />}
        title="The database is not set up yet"
        action={<Button onClick={() => void board.refresh()}>Check again</Button>}
      >
        <p>The tables do not exist in this Supabase project. Run the two migration files, in order:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <span className={code}>supabase/migrations/0001_schema.sql</span>
          </li>
          <li>
            <span className={code}>supabase/migrations/0002_seed_placeholder.sql</span> (optional sample data)
          </li>
        </ol>
        <p>
          Paste each into the Supabase SQL Editor, or run <span className={code}>supabase db push</span> with the CLI.
        </p>
      </Message>
    );
  }

  if (board.error) {
    return (
      <Message
        icon={<AlertTriangle size={18} />}
        title="Could not load the board"
        action={<Button onClick={() => void board.refresh()}>Try again</Button>}
      >
        <p>{board.error}</p>
      </Message>
    );
  }

  return <>{children}</>;
}
