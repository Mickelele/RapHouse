-- Kolejność paska w sekcji "Ruch", ekipa "O nas" z panelu admina, drobne zmiany linków.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.
-- (Wymaga wcześniejszych: 20261025000000_promo_materials.sql i 20261026000000_movement_picks.sql)

-- ============ Kolejność w pasku "Ruch" (wspólna dla klipów, rolek i grafik) ============
alter table public.promo_materials add column if not exists movement_order integer not null default 0;
alter table public.projects add column if not exists movement_order integer not null default 0;

-- ============ Ekipa (sekcja "O nas") ============
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  bio text not null default '',
  image_url text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;
drop policy if exists "public read" on public.team_members;
create policy "public read" on public.team_members
  for select using (published or public.is_admin());
drop policy if exists "admin write" on public.team_members;
create policy "admin write" on public.team_members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Obecna ekipa ze strony.
insert into public.team_members (name, role, bio, sort_order)
select v.name, v.role, v.bio, v.sort_order from (values
  ('Adam', 'Realizator', '14 lat tworzenia numerów, osiem nielegali nagranych i zmiksowanych własnoręcznie. Po półtora roku w warszawskim studiu założył RapHouse razem z Dominikiem. Na co dzień również technik dźwięku na eventach.', 1),
  ('Dominik', 'Realizator', 'Muzyka od zawsze - najpierw wokal, potem fascynacja tym, jak mix i mastering uwalniają pełnię brzmienia. Prowadzi studio razem z Adamem i nieustannie rozwija własny warsztat.', 2)
) as v(name, role, bio, sort_order)
where not exists (select 1 from public.team_members);

-- ============ Ścieżka procesu: "Sesja nagraniowa" prowadzi do kontaktu ============
update public.roadmap_steps set link = '/#kontakt'
  where label = 'Sesja nagraniowa' and link = '/rezerwacja';
