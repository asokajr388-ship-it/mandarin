"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto mt-16 text-sm text-white/80">
        <p>
          Pendaftaran berhasil. Silakan cek email kamu untuk verifikasi, lalu{" "}
          <Link href="/login" className="underline">
            masuk
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-medium mb-6">Daftar</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nama lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Password (min. 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black rounded px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
      <p className="text-sm text-white/60 mt-4">
        Sudah punya akun?{" "}
        <Link href="/login" className="underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
