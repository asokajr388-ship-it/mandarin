import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Buatkan 5 soal pilihan ganda bahasa Mandarin untuk level HSK ${hskLevel}.
Balas HANYA dengan JSON valid, tanpa teks lain, format persis seperti ini:
{
  "questions": [
    {
      "question": "teks pertanyaan (boleh campur Hanzi dan Indonesia)",
      "options": ["a", "b", "c", "d"],
      "correctIndex": 0
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

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
