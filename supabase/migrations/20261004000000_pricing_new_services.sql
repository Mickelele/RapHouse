-- Cennik: pozycje dla nowych usług (Klipy, Promo + opakowanie, Pisanie tekstów).
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.
-- TODO: ceny od klienta — po ustaleniu zmień je w panelu admina (zakładka Cennik).

insert into public.pricing (title, note, lines, sort_order)
select v.title, v.note, v.lines::jsonb, v.sort_order from (values
  ('Klipy', 'Realizacja teledysku — koncepcja, zdjęcia, montaż.',
   '[{"label": "", "price": "Wycena indywidualna"}]', 8),
  ('Promo + opakowanie', 'Rolki, sesja foto, opisy, okładka, miniaturka, strategia publikacji, dystrybucja.',
   '[{"label": "", "price": "Wycena indywidualna"}]', 9),
  ('Pisanie tekstów', 'Pomoc przy tekstach lub ghostwriting.',
   '[{"label": "", "price": "Wycena indywidualna"}]', 10)
) as v(title, note, lines, sort_order)
where not exists (select 1 from public.pricing p where p.title = v.title);
