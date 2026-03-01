-- ============================================================
-- MIGRATION FIX: Populate profiles from auth.users metadata
-- Run this in your Supabase SQL editor.
-- This reads XP, title, username etc. from the auth user metadata
-- and inserts/updates each user's profile row.
-- ============================================================

insert into public.profiles (id, display_name, selected_title, total_xp, quiz_records)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'username',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.email
  ) as display_name,
  coalesce(u.raw_user_meta_data->>'selected_title', 'none') as selected_title,
  coalesce((u.raw_user_meta_data->>'total_xp')::integer, 0) as total_xp,
  coalesce(u.raw_user_meta_data->'quiz_records', '{}'::jsonb) as quiz_records
from auth.users u
on conflict (id) do update set
  display_name  = excluded.display_name,
  selected_title = excluded.selected_title,
  total_xp      = excluded.total_xp,
  quiz_records  = excluded.quiz_records;
