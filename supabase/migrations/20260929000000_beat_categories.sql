-- Kategorie bitów zarządzane z panelu admina.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.

create table if not exists public.beat_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.beat_categories enable row level security;

drop policy if exists "public read" on public.beat_categories;
create policy "public read" on public.beat_categories for select using (true);

drop policy if exists "admin write" on public.beat_categories;
create policy "admin write" on public.beat_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Obecne kategorie (w tym te wpisane ręcznie przy bitach).
insert into public.beat_categories (name, sort_order) values
  ('Bangery / Mroczne', 1),
  ('RnB / Pop / Club / 80s', 2),
  ('Spokojne / Klimatyczne', 3)
on conflict (name) do nothing;

insert into public.beat_categories (name, sort_order)
select distinct category, 100 from public.beats where category is not null
on conflict (name) do nothing;

-- Zmiana nazwy kategorii przenosi się na bity; usunięcie kategorii zostawia bity bez kategorii.
alter table public.beats drop constraint if exists beats_category_fkey;
alter table public.beats
  add constraint beats_category_fkey foreign key (category)
  references public.beat_categories (name) on update cascade on delete set null;
