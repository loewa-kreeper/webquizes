-- Table to store quiz results for leaderboards and personal bests
create table public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  quiz_id text not null,
  score integer not null,
  total_score integer not null,
  time_ms integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast leaderboard queries
create index idx_quiz_results_lookup on public.quiz_results (quiz_id, score desc, time_ms asc);

-- Enable Row Level Security
alter table public.quiz_results enable row level security;

-- Policies
-- 1. Everyone can read results (for leaderboards)
create policy "Anyone can view quiz results" 
on public.quiz_results for select 
using (true);

-- 2. Users can only insert their own results
create policy "Users can insert their own results" 
on public.quiz_results for insert 
with check (auth.uid() = user_id);

-- 3. Users can delete their own results (optional)
create policy "Users can delete their own results" 
on public.quiz_results for delete 
using (auth.uid() = user_id);
