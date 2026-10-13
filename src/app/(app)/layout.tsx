"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ColorDialog } from "@/components/color-dialog";
import { Gate } from "@/components/gate";
import { Header } from "@/components/header";
import { useBoard } from "@/lib/store";

function Shell({ children }: { children: ReactNode }) {
  const board = useBoard();
  const router = useRouter();
  const pathname = usePathname();
  const bleed = pathname === "/tasks" || pathname === "/tasks/";

  useEffect(() => {
    if (!board.loading && !board.me) router.replace("/");
  }, [board.loading, board.me, router]);

  if (!board.me) return null;

  return (
    <>
      <Header />
      {/* people who have not picked a colour yet are asked once */}
      <ColorDialog open={board.needsColor} first onClose={() => {}} />
      <main className={bleed ? "w-full" : "mx-auto w-full max-w-[2000px] px-4 py-6 sm:px-6"}>{children}</main>
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
