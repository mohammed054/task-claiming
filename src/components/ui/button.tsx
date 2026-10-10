import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:bg-white disabled:bg-fg/30 disabled:text-bg/60",
  secondary: "border border-line-strong bg-raised text-fg hover:bg-hover disabled:text-faint disabled:hover:bg-raised",
  ghost: "text-muted hover:bg-hover hover:text-fg disabled:text-faint disabled:hover:bg-transparent",
  danger: "border border-danger/40 text-danger hover:bg-danger/10 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-7 gap-1.5 px-2.5 text-[12px]",
  md: "h-9 gap-2 px-3.5 text-[13px]",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant = "secondary", size = "md", loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
