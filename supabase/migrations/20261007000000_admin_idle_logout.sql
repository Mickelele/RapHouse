-- Wylogowanie adminów po 10 minutach bezczynności - wymuszane przez serwer.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.
--
-- Jak to działa:
--  1. Panel admina przy aktywności (najwyżej raz na minutę) woła admin_heartbeat() -> last_seen.
--  2. Endpoint logout_idle_admins(secret) usuwa sesje adminów bez aktywności od 10 minut.
--     Wywołuje go co 10 minut zewnętrzny cron (np. cron-job.org) albo pg_cron (na dole pliku).
--  3. Panel co minutę sprawdza sesję na serwerze - usuniętą od razu zamienia na ekran logowania.

-- ============ Ostatnia aktywność adminów ============
create table if not exists public.admin_activity (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_seen timestamptz not null default now()
);

alter table public.admin_activity enable row level security;
-- Brak polityk: tabela dostępna tylko przez funkcje poniżej.

create or replace function public.admin_heartbeat()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return;
  end if;
  insert into public.admin_activity (user_id, last_seen)
  values (auth.uid(), now())
  on conflict (user_id) do update set last_seen = excluded.last_seen;
end;
$$;

revoke all on function public.admin_heartbeat() from public, anon;
grant execute on function public.admin_heartbeat() to authenticated;

-- ============ Tajny klucz endpointu (schemat niedostępny przez API) ============
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.settings (
  key text primary key,
  value text not null
);

insert into private.settings (key, value)
values ('cron_secret', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (key) do nothing;

-- ============ Endpoint: usuń sesje bezczynnych adminów ============
-- POST https://<projekt>.supabase.co/rest/v1/rpc/logout_idle_admins
--   nagłówki: apikey: <anon key>, Content-Type: application/json
--   body:     {"secret": "<cron_secret>"}
create or replace function public.logout_idle_admins(secret text, idle_minutes integer default 10)
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

revoke all on function public.logout_idle_admins(text, integer) from public;
grant execute on function public.logout_idle_admins(text, integer) to anon, authenticated;

-- ============ Klucz do wpisania w cronie ============
-- Po uruchomieniu odczytaj go zapytaniem:
--   select value from private.settings where key = 'cron_secret';

-- ============ Opcjonalnie: cron w samym Supabase zamiast zewnętrznej strony ============
-- Database → Extensions → włącz "pg_cron", potem uruchom:
--   select cron.schedule(
--     'logout-idle-admins',
--     '*/10 * * * *',
--     $$select public.logout_idle_admins((select value from private.settings where key = 'cron_secret'))$$
--   );
