"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hskLevel, setHskLevel] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("hsk_level")
        .eq("id", user.id)
        .single();
      if (data) setHskLevel(data.hsk_level);
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
      if (typeof data.hskLevel === "number") {
        setHskLevel(data.hskLevel);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium">Chat tutor Mandarin</h1>
        {hskLevel && (
          <span className="text-xs bg-white/10 rounded-full px-3 py-1">
            HSK {hskLevel}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-white/50">
            Mulai ngobrol dalam bahasa Mandarin sesuai level kamu. AI akan menyesuaikan
            kosakata dan mengoreksi kesalahan tata bahasa kamu.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-white text-black self-end"
                : "bg-white/10 self-start"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-xs text-white/40">AI sedang mengetik...</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan dalam bahasa Mandarin atau Indonesia..."
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}
