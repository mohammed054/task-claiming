import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-md border border-line-strong bg-panel px-3 py-2 text-[13px] text-fg placeholder:text-faint focus:border-muted focus-visible:outline-none disabled:opacity-50";

// the chevron itself is drawn by the `select` rule in globals.css
export const selectClass = cn(inputClass, "appearance-none pr-8");

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[12px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-faint">{hint}</span>}
    </label>
  );
}
