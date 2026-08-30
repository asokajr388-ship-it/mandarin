"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  hsk_level: number;
  xp: number;
};

export default function LeaderboardPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      const { data } = await supabase
        .from("profiles")
        .select("id, username, hsk_level, xp")
        .order("hsk_level", { ascending: false })
        .order("xp", { ascending: false });

      if (data) setProfiles(data);
    })();

    // Subscribe realtime: setiap ada perubahan di tabel profiles,
    // re-fetch daftar leaderboard supaya semua user melihat update.
    const channel = supabase
      .channel("leaderboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        async () => {
          const { data } = await supabase
            .from("profiles")
            .select("id, username, hsk_level, xp")
            .order("hsk_level", { ascending: false })
            .order("xp", { ascending: false });
          if (data) setProfiles(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Leaderboard</h1>
      <div className="flex flex-col gap-2">
        {profiles.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center justify-between rounded-lg px-4 py-3 border ${
              p.id === currentUserId
                ? "border-white bg-white/10"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-5">{i + 1}</span>
              <span className="text-sm">{p.username || "Pelajar"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50">{p.xp} XP</span>
              <span className="text-xs bg-white/10 rounded-full px-3 py-1">
                HSK {p.hsk_level}
              </span>
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <p className="text-sm text-white/50">Belum ada pelajar terdaftar.</p>
        )}
      </div>
    </div>
  );
}
