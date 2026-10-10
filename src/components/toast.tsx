"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "error" | "success";
type ToastFn = (message: string, kind?: Kind) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string; kind: Kind }[]>([]);
  const counter = useRef(0);

  const toast = useCallback<ToastFn>((message, kind = "success") => {
    const id = ++counter.current;
    setItems((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), kind === "error" ? 6000 : 3500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex max-w-md items-start gap-2.5 rounded-lg border bg-raised px-3.5 py-2.5 text-[13px] shadow-lg shadow-black/40",
              t.kind === "error" ? "border-danger/40" : "border-line-strong",
            )}
          >
            {t.kind === "error" ? (
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-danger" />
            ) : (
              <Check size={15} className="mt-0.5 shrink-0 text-done" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
