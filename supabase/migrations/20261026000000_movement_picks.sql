-- Wybór z panelu admina, co jest w przewijanym pasku w sekcji "Ruch" na stronie głównej.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.
--
-- Zaznaczone rolki / grafiki / klipy pokazują się w pasku. Jeśli w danym rodzaju nic nie jest
-- zaznaczone, strona losuje 3 pozycje tego rodzaju.
alter table public.promo_materials add column if not exists in_movement boolean not null default false;
alter table public.projects add column if not exists in_movement boolean not null default false;
