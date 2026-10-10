import { CheckCircle2, Circle, CircleDot, Loader, Lock, type LucideIcon } from "lucide-react";
import type { Priority, TaskState } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export const STATE_META: Record<
  TaskState,
  { label: string; icon: LucideIcon; badge: string; text: string; color: string }
> = {
  locked: {
    label: "Awaiting",
    icon: Lock,
    badge: "border-line text-faint",
    text: "text-faint",
    color: "var(--color-faint)",
  },
  open: {
    label: "Open",
    icon: Circle,
    badge: "border-line-strong text-open",
    text: "text-open",
    color: "var(--color-open)",
  },
  claimed: {
    label: "Claimed",
    icon: CircleDot,
    badge: "border-claimed/30 bg-claimed/10 text-claimed",
    text: "text-claimed",
    color: "var(--color-claimed)",
  },
  in_progress: {
    label: "In progress",
    icon: Loader,
    badge: "border-progress/30 bg-progress/10 text-progress",
    text: "text-progress",
    color: "var(--color-progress)",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    badge: "border-done/30 bg-done/10 text-done",
    text: "text-done",
    color: "var(--color-done)",
  },
};

export function StatusBadge({ state, className }: { state: TaskState; className?: string }) {
  const meta = STATE_META[state];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        meta.badge,
        className,
      )}
    >
      <Icon size={11} strokeWidth={2.25} />
      {meta.label}
    </span>
  );
}

const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  critical: { label: "Critical", className: "text-danger" },
  high: { label: "High", className: "text-claimed" },
  medium: { label: "Medium", className: "text-muted" },
  low: { label: "Low", className: "text-faint" },
};

export function PriorityMark({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META.medium;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px]", meta.className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

const AVATAR_TONES = ["#3b4654", "#473f56", "#3d5147", "#554638", "#3b4f55", "#53404a", "#454a36", "#4a4a4a"];

function toneFor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function Avatar({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      title={name}
      style={{ width: size, height: size, background: toneFor(name), fontSize: Math.round(size * 0.4) }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium text-fg/90", className)}
    >
      {initials(name)}
    </span>
  );
}
