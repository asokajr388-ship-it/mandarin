import type { Metadata } from "next";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mandarin AI",
  description: "Belajar Mandarin dipandu AI dengan level HSK dan leaderboard realtime",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <nav className="border-b border-white/10 px-6 py-4 flex gap-6 items-center">
          <span className="font-semibold">Mandarin AI</span>
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            Dashboard
          </Link>
          <Link href="/chat" className="text-sm text-white/70 hover:text-white">
            Chat Tutor
          </Link>
          <Link href="/quiz" className="text-sm text-white/70 hover:text-white">
            Kuis
          </Link>
          <Link href="/leaderboard" className="text-sm text-white/70 hover:text-white">
            Leaderboard
          </Link>
          <SignOutButton />
        </nav>
        <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
