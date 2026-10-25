-- Materiały promocyjne (rolki i grafiki) edytowane z panelu admina - zakładka na /klipy
-- i przewijany pasek w sekcji "Ruch" na stronie głównej.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.

-- ============ Materiały promocyjne ============
create table if not exists public.promo_materials (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'rolka' check (kind in ('rolka', 'grafika')),
  title text not null,
  artist text,
  -- Okładka rolki albo sama grafika.
  image_url text,
  -- Rolka: YouTube Shorts (odtwarza się na stronie) albo Instagram / TikTok (nowa karta).
  video_url text,
  description text not null default '',
  links jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.promo_materials enable row level security;
drop policy if exists "public read" on public.promo_materials;
create policy "public read" on public.promo_materials
  for select using (published or public.is_admin());
drop policy if exists "admin write" on public.promo_materials;
create policy "admin write" on public.promo_materials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ Ścieżka procesu ============
-- "Pomysł" nie jest klikalny; "Materiały promocyjne" prowadzą do nowej zakładki na /klipy.
-- Zmieniamy tylko domyślne wartości - linki ustawione ręcznie w panelu zostają.
update public.roadmap_steps set link = null where label = 'Pomysł' and link = '/#kontakt';
update public.roadmap_steps set link = '/klipy?zakladka=materialy'
  where label = 'Materiały promocyjne' and link = '/#cennik';

-- ============ Cennik: karta materiałów promocyjnych ============
update public.pricing set link = '/klipy?zakladka=materialy', link_label = 'Zobacz materiały'
  where link is null and title ilike 'Materia%promocyjne%';
