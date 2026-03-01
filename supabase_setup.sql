-- Table for global user statistics and profile info
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  selected_title text default 'none',
  total_xp integer default 0,
  quiz_records jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table to store quiz results (history/activity log)
create table public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quiz_id text not null,
  score integer not null,
  total_score integer not null,
  time_ms integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast leaderboard queries
create index idx_quiz_results_lookup on public.quiz_results (quiz_id, score desc, time_ms asc);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.quiz_results enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Quiz Results Policies
create policy "Anyone can view quiz results" on public.quiz_results for select using (true);
create policy "Users can insert their own results" on public.quiz_results for insert with check (auth.uid() = user_id);
create policy "Users can update their own results" on public.quiz_results for update using (auth.uid() = user_id);
create policy "Users can delete their own results" on public.quiz_results for delete using (auth.uid() = user_id);

-- Trigger to handle updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();
