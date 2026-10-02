-- Cennik edytowalny z panelu + przypinanie aktualności na stronie głównej.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.

-- ============ Cennik ============
create table if not exists public.pricing (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text,
  -- [{ "label": "1h – 2h", "price": "120 PLN/h" }, ...]; label może być pusty
  lines jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.pricing enable row level security;

drop policy if exists "public read" on public.pricing;
create policy "public read" on public.pricing
  for select using (published or public.is_admin());

drop policy if exists "admin write" on public.pricing;
create policy "admin write" on public.pricing
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Obecny cennik (bez „Spotkania z producentem”).
insert into public.pricing (title, note, lines, sort_order)
select v.title, v.note, v.lines::jsonb, v.sort_order from (values
  ('Sesja z realizatorem', 'Wybierz tę opcję, jeśli chcesz pracować z naszym realizatorem.',
   '[{"label": "1h – 2h", "price": "120 PLN/h"}, {"label": "3h – 4h", "price": "100 PLN/h"}, {"label": "5h i więcej", "price": "80 PLN/h"}]', 1),
  ('Wynajem studia (samoobsługa)', 'Wynajem studia bez naszego realizatora. Nagrywasz się sam lub ze znajomymi.',
   '[{"label": "do 3h", "price": "60 PLN/h"}, {"label": "od 4h", "price": "40 PLN/h"}]', 2),
  ('Mix / Master Standard', 'Bit (1 plik) · jeden wykonawca.', '[{"label": "", "price": "250 PLN"}]', 3),
  ('Mix / Master Premium', 'Bit (ścieżki) lub dwóch wykonawców.', '[{"label": "", "price": "350 PLN"}]', 4),
  ('Mix / Master Full', 'Bit (ścieżki) · maks. trzech wykonawców.', '[{"label": "", "price": "450 PLN"}]', 5),
  ('Bity z katalogu', 'Niespełna setka bitów w naszym katalogu.', '[{"label": "", "price": "300 – 700 PLN"}]', 6),
  ('Bit na zamówienie', 'Producent tworzy bit od podstaw, również pod konkretną acapellę.', '[{"label": "", "price": "400 – 750 PLN"}]', 7)
) as v(title, note, lines, sort_order)
where not exists (select 1 from public.pricing);

delete from public.pricing where title = 'Spotkanie z producentem';

-- ============ Przypięta aktualność ============
alter table public.news add column if not exists pinned boolean not null default false;

-- Najwyżej jedna przypięta: przypięcie nowej odpina poprzednią.
create or replace function public.news_single_pinned()
returns trigger
language plpgsql
as $$
begin
  if new.pinned then
    update public.news set pinned = false where pinned and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists news_single_pinned on public.news;
create trigger news_single_pinned
  before insert or update of pinned on public.news
  for each row when (new.pinned)
  execute function public.news_single_pinned();

create unique index if not exists news_one_pinned on public.news (pinned) where pinned;
