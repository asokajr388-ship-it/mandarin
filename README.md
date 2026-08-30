# Mandarin AI App

Aplikasi belajar Mandarin dengan tutor AI (chat + kuis) dan leaderboard level HSK realtime.

## Isi project
- `schema.sql` — jalankan ini DULU di Supabase SQL Editor (bikin tabel, RLS, realtime)
- `supabase_patch.sql` — jalankan SETELAH schema.sql (menyesuaikan trigger nama user)
- `src/app` — semua halaman & API route Next.js
- `src/lib/supabase` — koneksi ke Supabase (browser, server, middleware)

## Cara pakai (tanpa install apapun di komputer, langsung dari GitHub)

1. **Supabase**
   - Buat project baru di supabase.com
   - Buka SQL Editor, jalankan isi `schema.sql`, lalu jalankan isi `supabase_patch.sql`
   - Buka Project Settings > API, catat `Project URL` dan `anon public key`

2. **Upload ke GitHub**
   - Buat repository baru (kosong) di GitHub
   - Upload semua file & folder di project ini ke repo tersebut
     (lewat web GitHub: "Add file" > "Upload files", drag semua isi folder)

3. **Deploy ke Vercel**
   - Buka vercel.com > New Project > import repo GitHub yang barusan dibuat
   - Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan 3 ini:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `ANTHROPIC_API_KEY` (ambil dari console.anthropic.com)
   - Klik Deploy

4. Setelah deploy selesai, buka URL yang diberikan Vercel, daftar akun baru, dan mulai belajar.

## Catatan
- Level HSK naik otomatis tiap 100 XP (dari chat +2 XP/pesan, dari kuis +10 XP/jawaban benar), maksimal HSK 6.
- Leaderboard update otomatis realtime ke semua user yang sedang membuka halaman itu, tanpa perlu refresh.
