import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, hsk_level, xp")
    .eq("id", user?.id)
    .single();

  return (
    <div>
      <h1 className="text-xl font-medium mb-2">
        Halo, {profile?.username || "Pelajar"}
      </h1>
      <p className="text-sm text-white/60 mb-8">
        Level kamu sekarang: HSK {profile?.hsk_level ?? 1} · {profile?.xp ?? 0} XP
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/chat"
          className="border border-white/10 rounded-lg p-4 hover:border-white/30"
        >
          <p className="font-medium text-sm mb-1">Chat tutor</p>
          <p className="text-xs text-white/50">Latihan percakapan dengan AI</p>
        </Link>
        <Link
          href="/quiz"
          className="border border-white/10 rounded-lg p-4 hover:border-white/30"
        >
          <p className="font-medium text-sm mb-1">Kuis</p>
          <p className="text-xs text-white/50">Uji pemahaman, dapat XP</p>
        </Link>
        <Link
          href="/leaderboard"
          className="border border-white/10 rounded-lg p-4 hover:border-white/30"
        >
          <p className="font-medium text-sm mb-1">Leaderboard</p>
          <p className="text-xs text-white/50">Lihat level semua pelajar</p>
        </Link>
      </div>
    </div>
  );
}
