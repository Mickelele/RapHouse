-- RapHouse: aktualności, bity, realizacje + panel admina.
-- Uruchom całość w Supabase: SQL Editor → New query → wklej → Run.

-- ============ Admini ============
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ============ Aktualności ============
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  image_url text,
  video_url text,
  links jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============ Bity ============
create table if not exists public.beats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  bpm integer,
  price text,
  description text not null default '',
  audio_url text,
  image_url text,
  video_url text,
  links jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============ Realizacje ============
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  artist text not null,
  title text not null,
  description text not null default '',
  audio_url text,
  image_url text,
  video_url text,
  links jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============ RLS: wszyscy czytają opublikowane, admin robi wszystko ============
do $$
declare t text;
begin
  foreach t in array array['news', 'beats', 'projects'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format(
      'create policy "public read" on public.%I for select using (published or public.is_admin())', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format(
      'create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ============ Pliki (mp3, zdjęcia) ============
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ============ Startowe realizacje (te, które były wpisane na stronie) ============
insert into public.projects (artist, title, description, sort_order)
select * from (values
  ('Arach', 'Wilk z Wall Street ft. Madafaka', 'Klasyczny oldschool. Duży, ciepły wokal: emulacje analogowych kompresorów, saturacja, krótkie pogłosy.', 1),
  ('Pszczoła', 'Tak się z tym czuję', 'Ciepłe, analogowe brzmienie. Refren strojony manualnie i autotunem, wokal wkomponowany radiowo.', 2),
  ('Czeski', 'Bez kwitu ft. Emikae, Loli', 'Oldschool z efektami specjalnymi: pitch down, rwane wokale, reverse reverb, wstawki dźwiękowe.', 3),
  ('Brutus', 'Nieśmiertelność się załancza', 'Ciemna energia trapu. Wyraźne niskie pasma, mocny limiter, saturacja i przestrzeń z reverb/delay.', 4),
  ('Pszczoła x Jezzy', 'Świetnie sobie radzę', 'Oldschoolowa nawijka w nowoczesnym brzmieniu — ozdobne efekty na podbitkach i adlibach.', 5),
  ('Pszczoła', 'NCPC?', 'Dużo przerw w nawijce, więc dużo delayów — przejrzystość i bounce bez chaosu.', 6),
  ('BSNB', 'VAMOS ft. Czeski', 'Domowe nagranie wyciągnięte w miksie. Ręczne strojenie z nowoczesnym, autotune''owym charakterem.', 7),
  ('Lasek', 'Później zadzwonię', 'Wokal zatopiony w muzyce dla mrocznego klimatu, refren z auto-tune i amerykańskim sznytem.', 8)
) as v(artist, title, description, sort_order)
where not exists (select 1 from public.projects);

-- ============ Nadanie admina ============
-- 1. Supabase → Authentication → Users → Add user (email + hasło, zaznacz "Auto Confirm").
-- 2. Odkomentuj i uruchom z właściwym mailem:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'twoj@mail.pl'
-- on conflict do nothing;
