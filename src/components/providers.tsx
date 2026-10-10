"use client";

import type { ReactNode } from "react";
import { BoardProvider } from "@/lib/store";
import { ToastProvider } from "./toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <BoardProvider>{children}</BoardProvider>
    </ToastProvider>
  );
}
