-- Sprzęt i zdjęcia galerii edytowane z panelu admina.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.

-- ============ Sprzęt (sekcja „Sprzęt, który robi robotę”) ============
create table if not exists public.gear (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============ Zdjęcia galerii ============
-- Panel wgrywa każde zdjęcie w dwóch rozmiarach WebP (640 i 1280 px) do bucketu "media".
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  alt text not null,
  src_640 text not null,
  src_1280 text not null,
  -- wymiary największej wersji (do rezerwacji miejsca na stronie)
  width integer not null,
  height integer not null,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['gear', 'gallery_images'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format(
      'create policy "public read" on public.%I for select using (published or public.is_admin())', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format(
      'create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Obecna lista sprzętu ze strony.
insert into public.gear (name, tag, sort_order)
select v.name, v.tag, v.sort_order from (values
  ('Apollo Twin', 'Interface', 1),
  ('Warm Audio WA-47F', 'Mikrofon / kabina', 2),
  ('Rode K2', 'Talkback', 3),
  ('KRK Rokit 5', 'Odsłuchy', 4),
  ('Ryzen 7 7800X3D · 32GB', 'Maszyna', 5),
  ('Cubase', 'DAW', 6),
  ('Reaper', 'DAW', 7),
  ('FL Studio', 'DAW', 8),
  ('Antares Auto-Tune', 'Wtyczki', 9),
  ('FabFilter', 'Wtyczki', 10),
  ('iZotope Ozone 9', 'Mastering', 11)
) as v(name, tag, sort_order)
where not exists (select 1 from public.gear);
