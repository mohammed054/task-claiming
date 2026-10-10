"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Gate } from "@/components/gate";
import { Header } from "@/components/header";
import { useBoard } from "@/lib/store";

function Shell({ children }: { children: ReactNode }) {
  const board = useBoard();
  const router = useRouter();

  useEffect(() => {
    if (!board.loading && !board.me) router.replace("/");
  }, [board.loading, board.me, router]);

  if (!board.me) return null;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Gate>
      <Shell>{children}</Shell>
    </Gate>
  );
}
