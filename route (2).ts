import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { calculateHskLevel } from "@/lib/level";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const XP_PER_MESSAGE = 2;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("hsk_level, xp")
    .eq("id", user.id)
    .single();

  const hskLevel = profile?.hsk_level ?? 1;

  const { messages } = await request.json();

  const systemPrompt = `Kamu adalah tutor bahasa Mandarin yang sabar dan ramah untuk pelajar level HSK ${hskLevel}.
Aturan:
- Balas terutama dalam bahasa Mandarin (Hanzi) dengan kosakata dan tata bahasa yang sesuai level HSK ${hskLevel}, jangan lebih sulit.
- Sertakan pinyin di dalam kurung setelah setiap kalimat Mandarin.
- Beri terjemahan singkat bahasa Indonesia di baris berikutnya.
- Jika pelajar membuat kesalahan tata bahasa, koreksi dengan lembut dan jelaskan singkat.
- Jaga respons singkat (maksimal 4-5 kalimat) supaya tidak membebani pelajar.`;

  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const reply = completion.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const newXp = (profile?.xp ?? 0) + XP_PER_MESSAGE;
  const newHskLevel = calculateHskLevel(newXp);
  const leveledUp = newHskLevel > hskLevel;

  await supabase
    .from("profiles")
    .update({ xp: newXp, hsk_level: newHskLevel })
    .eq("id", user.id);

  if (leveledUp) {
    await supabase.from("level_history").insert({
      user_id: user.id,
      hsk_level_before: hskLevel,
      hsk_level_after: newHskLevel,
    });
  }

  await supabase.from("chat_sessions").insert({
    user_id: user.id,
    summary: messages[messages.length - 1]?.content?.slice(0, 200) ?? null,
    xp_earned: XP_PER_MESSAGE,
  });

  return NextResponse.json({ reply, hskLevel: newHskLevel });
}
