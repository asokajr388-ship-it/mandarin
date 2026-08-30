-- =========================================================
-- SKEMA: Aplikasi Belajar Mandarin AI (HSK Level + Leaderboard Realtime)
-- Jalankan di Supabase SQL Editor
-- =========================================================

-- 1. PROFIL USER (level HSK & XP)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  hsk_level int not null default 1 check (hsk_level between 1 and 6),
  xp int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. RIWAYAT KUIS
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hsk_level int not null,
  score int not null,
  total_questions int not null,
  xp_earned int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. RIWAYAT SESI CHAT DENGAN AI TUTOR
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  summary text,
  xp_earned int not null default 0,
  created_at timestamptz not null default now()
);

-- 4. LOG KENAIKAN LEVEL (untuk histori & notifikasi leaderboard)
create table if not exists public.level_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hsk_level_before int not null,
  hsk_level_after int not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- TRIGGER: otomatis buat baris profil saat user baru daftar
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- TRIGGER: auto-update updated_at
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.level_history enable row level security;

-- Semua user login boleh LIHAT semua profil (dibutuhkan untuk leaderboard)
create policy "Profiles are viewable by everyone (authenticated)"
  on public.profiles for select
  to authenticated
  using (true);

-- User hanya boleh update profil miliknya sendiri
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Quiz attempts: user hanya boleh insert & lihat miliknya sendiri
create policy "Users can insert own quiz attempts"
  on public.quiz_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view own quiz attempts"
  on public.quiz_attempts for select
  to authenticated
  using (auth.uid() = user_id);

-- Chat sessions: sama, privat per user
create policy "Users can insert own chat sessions"
  on public.chat_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view own chat sessions"
  on public.chat_sessions for select
  to authenticated
  using (auth.uid() = user_id);

-- Level history: boleh dilihat semua orang (opsional, untuk feed aktivitas leaderboard)
create policy "Level history viewable by everyone (authenticated)"
  on public.level_history for select
  to authenticated
  using (true);

create policy "Users can insert own level history"
  on public.level_history for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =========================================================
-- REALTIME: aktifkan broadcast perubahan pada tabel profiles
-- (supaya leaderboard update otomatis saat hsk_level/xp berubah)
-- =========================================================
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.level_history;

-- =========================================================
-- INDEX pendukung performa leaderboard & riwayat
-- =========================================================
create index if not exists idx_profiles_hsk_xp on public.profiles (hsk_level desc, xp desc);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts (user_id, created_at desc);
create index if not exists idx_level_history_created on public.level_history (created_at desc);
