"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Inbox, ListChecks, LogOut, Palette } from "lucide-react";
import { useBoard } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ColorDialog } from "./color-dialog";
import { RequestsDialog, useIncomingRequests } from "./requests-dialog";
import { Avatar } from "./status";

const NAV = [
  { href: "/tasks", label: "Tasks" },
  { href: "/manage", label: "Manage" },
  { href: "/activity", label: "Activity" },
];

export function Header() {
  const board = useBoard();
  const pathname = usePathname();
  const router = useRouter();
  const incoming = useIncomingRequests();
  const [menuOpen, setMenuOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (!board.me) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[2000px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link href="/tasks" className="flex items-center gap-2.5 group">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.55)] ring-1 ring-white/25 transition-transform group-hover:scale-105">
            <ListChecks size={16} strokeWidth={2.4} className="drop-shadow" />
          </span>
          <span className="hidden text-[14px] font-semibold tracking-tight text-white/95 sm:inline group-hover:text-white transition-colors">
            Task Board
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                  active ? "bg-hover text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRequestsOpen(true)}
            aria-label={`Claim requests${incoming.length ? `, ${incoming.length} waiting` : ""}`}
            className="relative rounded-md p-2 text-muted transition-colors hover:bg-hover hover:text-fg"
          >
            <Inbox size={17} />
            {incoming.length > 0 && (
              <span className="absolute top-0.5 right-0.5 flex min-w-4 items-center justify-center rounded-full bg-claimed px-1 text-[10px] leading-4 font-semibold text-bg">
                {incoming.length}
              </span>
            )}
          </button>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-md py-1 pr-2 pl-1 transition-colors hover:bg-hover"
            >
              <Avatar name={board.me.name} size={26} />
              <span className="hidden max-w-32 truncate text-[13px] font-medium sm:inline">{board.me.name}</span>
              <ChevronDown size={14} className="text-faint" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-1.5 w-56 overflow-hidden rounded-lg border border-line-strong bg-raised shadow-xl shadow-black/50"
              >
                <div className="border-b border-line px-3 py-2.5">
                  <p className="text-[12px] text-faint">Signed in as</p>
                  <p className="truncate text-[13px] font-medium">{board.me.name}</p>
                </div>
                {board.colorsSupported && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setColorOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-muted transition-colors hover:bg-hover hover:text-fg"
                  >
                    <Palette size={14} />
                    Change colour
                    <span
                      className="ml-auto size-3.5 rounded-full ring-1 ring-white/20"
                      style={{ background: board.colorOf.get(board.me.id) }}
                    />
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    board.signOut();
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-muted transition-colors hover:bg-hover hover:text-fg"
                >
                  <LogOut size={14} />
                  Switch user
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ColorDialog open={colorOpen} onClose={() => setColorOpen(false)} />
      <RequestsDialog
        open={requestsOpen}
        onClose={() => setRequestsOpen(false)}
        onOpenTask={(code) => router.push(`/tasks?task=${encodeURIComponent(code)}`)}
      />
    </header>
  );
}
