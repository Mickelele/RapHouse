-- Klikalne pozycje cennika i ścieżka procesu w hero - edytowane z panelu admina.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.

-- ============ Cennik: odnośnik z karty ============
alter table public.pricing add column if not exists link text;
alter table public.pricing add column if not exists link_label text;

update public.pricing set link = '/rezerwacja', link_label = 'Sprawdź wolne terminy'
  where link is null and (title ilike 'Wynajem studia%' or title ilike 'Sesja z realizatorem%');
update public.pricing set link = '/bity#na-zamowienie', link_label = 'Zamów bit'
  where link is null and title ilike 'Bit na zamówienie%';
update public.pricing set link = '/bity#katalog', link_label = 'Zobacz katalog'
  where link is null and title ilike 'Bity z katalogu%';
update public.pricing set link = '/klipy', link_label = 'Zobacz klipy'
  where link is null and title ilike 'Klip%';

-- ============ Ścieżka procesu (hero: Pomysł → … → Dystrybucja) ============
-- "alternative" = krok jest alternatywą dla poprzedniego (rozwidlenie, np. wynajem albo sesja).
create table if not exists public.roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  link text,
  alternative boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.roadmap_steps enable row level security;
drop policy if exists "public read" on public.roadmap_steps;
create policy "public read" on public.roadmap_steps
  for select using (published or public.is_admin());
drop policy if exists "admin write" on public.roadmap_steps;
create policy "admin write" on public.roadmap_steps
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.roadmap_steps (label, link, alternative, sort_order)
select v.label, v.link, v.alternative, v.sort_order from (values
  ('Pomysł', '/#kontakt', false, 1),
  ('Tekst', '/#cennik', false, 2),
  ('Bit', '/bity', false, 3),
  ('Wynajem studia', '/rezerwacja', false, 4),
  ('Sesja nagraniowa', '/rezerwacja', true, 5),
  ('Mix / Master', '/#realizacje', false, 6),
  ('Teledysk', '/klipy', false, 7),
  ('Materiały promocyjne', '/#cennik', false, 8),
  ('Dystrybucja', '/#kontakt', false, 9)
) as v(label, link, alternative, sort_order)
where not exists (select 1 from public.roadmap_steps);
