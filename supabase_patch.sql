-- Jalankan ini SETELAH schema.sql, di SQL Editor Supabase.
-- Menyesuaikan trigger agar membaca "full_name" (dikirim dari form register)
-- alih-alih "username".

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;
