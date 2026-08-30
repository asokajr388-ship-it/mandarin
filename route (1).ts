import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("hsk_level")
    .eq("id", user.id)
    .single();

  const hskLevel = profile?.hsk_level ?? 1;

  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system:
      "Kamu adalah pembuat soal kuis bahasa Mandarin. Balas HANYA dengan JSON valid, tanpa teks lain, tanpa markdown code fence.",
    messages: [
      {
        role: "user",
        content: `Buatkan 5 soal pilihan ganda bahasa Mandarin untuk level HSK ${hskLevel}.
Format JSON persis seperti ini:
{
  "questions": [
    {
      "question": "teks pertanyaan (boleh campur Hanzi dan Indonesia)",
      "options": ["a", "b", "c", "d"],
      "correctIndex": 0
    }
  ]
}`,
      },
    ],
  });

  const text = completion.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  let quiz;
  try {
    quiz = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat kuis, coba lagi" },
      { status: 500 }
    );
  }

  return NextResponse.json({ hskLevel, ...quiz });
}
