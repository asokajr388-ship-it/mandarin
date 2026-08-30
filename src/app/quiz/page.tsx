"use client";

import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [hskLevel, setHskLevel] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    xpEarned: number;
    leveledUp: boolean;
    newHskLevel: number;
  } | null>(null);

  async function startQuiz() {
    setLoading(true);
    setResult(null);
    setQuestions(null);
    try {
      const res = await fetch("/api/quiz/generate", { method: "POST" });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setHskLevel(data.hskLevel);
        setAnswers(new Array(data.questions.length).fill(-1));
      }
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(qIndex: number, optIndex: number) {
    if (result) return;
    const next = [...answers];
    next[qIndex] = optIndex;
    setAnswers(next);
  }

  async function submitQuiz() {
    if (!questions) return;
    const score = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );

    setLoading(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hskLevel,
          score,
          totalQuestions: questions.length,
        }),
      });
      const data = await res.json();
      setResult({ score, ...data });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Kuis Mandarin</h1>
        {hskLevel && (
          <span className="text-xs bg-white/10 rounded-full px-3 py-1">
            HSK {hskLevel}
          </span>
        )}
      </div>

      {!questions && (
        <button
          onClick={startQuiz}
          disabled={loading}
          className="bg-white text-black rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Membuat soal..." : "Mulai kuis"}
        </button>
      )}

      {questions && (
        <div className="flex flex-col gap-6">
          {questions.map((q, qi) => (
            <div key={qi} className="border border-white/10 rounded-lg p-4">
              <p className="text-sm mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = result && oi === q.correctIndex;
                  const isWrongSelected = result && isSelected && oi !== q.correctIndex;
                  return (
                    <button
                      key={oi}
                      onClick={() => selectAnswer(qi, oi)}
                      className={`text-left text-sm rounded px-3 py-2 border ${
                        isCorrect
                          ? "border-green-400 bg-green-400/10"
                          : isWrongSelected
                          ? "border-red-400 bg-red-400/10"
                          : isSelected
                          ? "border-white bg-white/10"
                          : "border-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!result && (
            <button
              onClick={submitQuiz}
              disabled={loading || answers.includes(-1)}
              className="bg-white text-black rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Menilai..." : "Kumpulkan jawaban"}
            </button>
          )}

          {result && (
            <div className="border border-white/10 rounded-lg p-4 text-sm">
              <p>
                Skor: {result.score} / {questions.length} · +{result.xpEarned} XP
              </p>
              {result.leveledUp && (
                <p className="text-green-400 mt-1">
                  Selamat, kamu naik ke HSK {result.newHskLevel}!
                </p>
              )}
              <button
                onClick={startQuiz}
                className="mt-3 bg-white text-black rounded px-4 py-2 text-sm font-medium"
              >
                Kuis lagi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
