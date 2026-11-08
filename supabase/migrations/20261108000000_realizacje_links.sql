-- Utwory, klipy i oprawa wydania są na jednej stronie /realizacje (filtry). Stare linki /klipy
-- i tak przekierowują - ta migracja tylko podmienia je w bazie na nowe i zmienia nazwę kroku.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.

-- ============ Cennik ============
update public.pricing set link = '/realizacje?filtr=oprawa', link_label = 'Zobacz oprawę wydania'
  where link = '/klipy?zakladka=materialy';
update public.pricing set link = '/realizacje?filtr=klipy' where link = '/klipy';

-- ============ Ścieżka procesu ============
update public.roadmap_steps set label = 'Oprawa wydania', link = '/realizacje?filtr=oprawa'
  where label = 'Materiały promocyjne';
update public.roadmap_steps set link = '/realizacje?filtr=klipy' where link = '/klipy';
update public.roadmap_steps set link = '/realizacje?filtr=utwory' where link = '/realizacje';
