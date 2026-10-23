-- Regulaminy edytowane z panelu admina, wylogowanie po 1 h bezczynności, nowy adres realizacji.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.

-- ============ Regulaminy (podstrona /regulaminy) ============
create table if not exists public.regulations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.regulations enable row level security;
drop policy if exists "public read" on public.regulations;
create policy "public read" on public.regulations
  for select using (published or public.is_admin());
drop policy if exists "admin write" on public.regulations;
create policy "admin write" on public.regulations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Data ostatniej zmiany (pokazywana pod regulaminem).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists regulations_touch on public.regulations;
create trigger regulations_touch before update on public.regulations
  for each row execute function public.touch_updated_at();

-- ============ Wylogowanie adminów po 60 minutach (było 10) ============
-- Ta sama funkcja co w 20261007000000_admin_idle_logout.sql, zmieniona tylko wartość domyślna.
create or replace function public.logout_idle_admins(secret text, idle_minutes integer default 60)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  revoked integer;
begin
  if secret is null or secret <> (select value from private.settings where key = 'cron_secret') then
    raise exception 'Nieprawidłowy klucz' using errcode = '28000';
  end if;

  -- Sesja admina bez aktywności (albo bez żadnego heartbeatu) dłużej niż idle_minutes.
  delete from auth.sessions s
  using public.admins a
  left join public.admin_activity act on act.user_id = a.user_id
  where s.user_id = a.user_id
    and coalesce(act.last_seen, s.created_at) < now() - make_interval(mins => idle_minutes);

  get diagnostics revoked = row_count;
  return jsonb_build_object('revoked_sessions', revoked, 'at', now());
end;
$$;

-- ============ Ścieżka procesu: realizacje mają teraz własną podstronę ============
-- (tabela z 20261023000000_pricing_links_roadmap.sql - uruchom tamtą migrację najpierw)
update public.roadmap_steps set link = '/realizacje' where link = '/#realizacje';
