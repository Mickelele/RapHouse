-- Realizacje: kategoria Audio / Video i data premiery.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.

alter table public.projects
  add column if not exists category text not null default 'audio',
  add column if not exists released_on date;

alter table public.projects drop constraint if exists projects_category_check;
alter table public.projects
  add constraint projects_category_check check (category in ('audio', 'video'));
