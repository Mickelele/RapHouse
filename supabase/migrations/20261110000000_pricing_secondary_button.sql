-- Drugi (poboczny) przycisk na kartach cennika - edytowany z panelu admina.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.
alter table public.pricing add column if not exists link_secondary text;
alter table public.pricing add column if not exists link_secondary_label text;
