import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Board",
  description: "Claim, track and finish the blocks and tasks of the platform build.",
  icons: {
    icon: [
      { url: "icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "icon.svg",
    apple: "icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
