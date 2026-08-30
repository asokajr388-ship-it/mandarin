import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateHskLevel } from "@/lib/level";

const XP_PER_CORRECT = 10;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const { hskLevel, score, totalQuestions } = await request.json();

  const { data: profile } = await supabase
    .from("profiles")
    .select("hsk_level, xp")
    .eq("id", user.id)
    .single();

  const currentHskLevel = profile?.hsk_level ?? 1;
  const xpEarned = score * XP_PER_CORRECT;
  const newXp = (profile?.xp ?? 0) + xpEarned;
  const newHskLevel = calculateHskLevel(newXp);
  const leveledUp = newHskLevel > currentHskLevel;

  await supabase
    .from("profiles")
    .update({ xp: newXp, hsk_level: newHskLevel })
    .eq("id", user.id);

  await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    hsk_level: hskLevel,
    score,
    total_questions: totalQuestions,
    xp_earned: xpEarned,
  });

  if (leveledUp) {
    await supabase.from("level_history").insert({
      user_id: user.id,
      hsk_level_before: currentHskLevel,
      hsk_level_after: newHskLevel,
    });
  }

  return NextResponse.json({ xpEarned, newHskLevel, leveledUp });
}
