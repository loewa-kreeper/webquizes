-- ============================================================
-- MIGRATION: Add profiles table + clean up quiz_results
-- Run this in your Supabase SQL editor.
-- Safe to run on an existing database.
-- ============================================================


-- 1. Create the profiles table (stores all user stats)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  selected_title text default 'none',
  total_xp integer default 0,
  quiz_records jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security on profiles
alter table public.profiles enable row level security;

-- 3. Policies for profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- 4. Auto-update updated_at on every profile change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();


-- 5. Migrate existing user stats into profiles from quiz_results
--    (copies the most recent name/title/level for each user)
insert into public.profiles (id, display_name, selected_title, total_xp)
select distinct on (user_id)
  user_id as id,
  user_name as display_name,
  coalesce(user_title, 'none') as selected_title,
  coalesce(user_xp, 0) as total_xp
from public.quiz_results
where user_id is not null
order by user_id, created_at desc
on conflict (id) do nothing;


-- 6. Drop the now-redundant denormalized columns from quiz_results
--    (quiz_results only needs raw score data from now on)
alter table public.quiz_results
  drop column if exists user_name,
  drop column if exists user_title,
  drop column if exists user_level,
  drop column if exists user_xp;


-- Done!
-- Your profiles table is now the single source of truth for:
--   display_name, selected_title, total_xp, quiz_records
-- The quiz_results table now only stores: user_id, quiz_id, score, total_score, time_ms
