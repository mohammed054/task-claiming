"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ListChecks, Plus, Search } from "lucide-react";
import { Gate } from "@/components/gate";
import { Avatar } from "@/components/status";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/fields";
import { useBoard } from "@/lib/store";

function Picker() {
  const board = useBoard();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  // a remembered person goes straight in
  useEffect(() => {
    if (board.me) router.replace("/tasks");
  }, [board.me, router]);

  const stats = useMemo(() => {
    const map = new Map<string, { active: number; done: number }>();
    for (const task of board.tasks) {
      if (!task.claimed_by) continue;
      const entry = map.get(task.claimed_by) ?? { active: 0, done: 0 };
      if (task.status === "done") entry.done++;
      else entry.active++;
      map.set(task.claimed_by, entry);
    }
    return map;
  }, [board.tasks]);

  const visible = board.members.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));

  function choose(id: string) {
    board.selectMember(id);
    router.push("/tasks");
  }

  async function create() {
    if (!newName.trim() || busy) return;
    setBusy(true);
    const member = await board.addMember(newName);
    setBusy(false);
    if (member) choose(member.id);
  }

  if (board.me) return null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg border border-line-strong bg-raised">
          <ListChecks size={19} />
        </div>
        <div>
          <h1 className="text-[17px] leading-tight font-semibold">Task Board</h1>
          <p className="text-[13px] text-muted">Choose your name to continue</p>
        </div>
      </div>

      <section className="rounded-xl border border-line bg-panel">
        {board.members.length > 6 && (
          <div className="relative border-b border-line p-3">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-6 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names"
              className={`${inputClass} pl-8`}
            />
          </div>
        )}

        {board.members.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-muted">No names yet. Add yours below.</p>
        ) : visible.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-muted">No one matches “{query}”.</p>
        ) : (
          <ul className="max-h-[46dvh] divide-y divide-line overflow-y-auto">
            {visible.map((member) => {
              const s = stats.get(member.id);
              return (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => choose(member.id)}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-hover"
                  >
                    <Avatar name={member.name} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{member.name}</span>
                      <span className="block text-[12px] text-faint">
                        {s ? `${s.active} active · ${s.done} done` : "No tasks yet"}
                      </span>
                    </span>
                    <ArrowRight size={15} className="text-faint transition-colors group-hover:text-fg" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <form
          className="flex gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Not listed? Add a new name"
            maxLength={60}
            className={inputClass}
          />
          <Button type="submit" variant="primary" loading={busy} disabled={!newName.trim()}>
            <Plus size={14} />
            Add
          </Button>
        </form>
      </section>

      <p className="mt-4 text-[12px] text-faint">No password needed. This browser will remember you.</p>
    </main>
  );
}

export default function HomePage() {
  return (
    <Gate>
      <Picker />
    </Gate>
  );
}
