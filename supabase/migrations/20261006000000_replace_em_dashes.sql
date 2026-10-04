-- Zamiana długich myślników "—" na zwykłe "-" w treściach z bazy.
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run. Można uruchomić ponownie.

update public.news
  set title = replace(title, '—', '-'), body = replace(body, '—', '-')
  where title like '%—%' or body like '%—%';

update public.projects
  set artist = replace(artist, '—', '-'), title = replace(title, '—', '-'),
      description = replace(description, '—', '-')
  where artist like '%—%' or title like '%—%' or description like '%—%';

update public.beats
  set title = replace(title, '—', '-'), description = replace(description, '—', '-')
  where title like '%—%' or description like '%—%';

update public.pricing
  set title = replace(title, '—', '-'), note = replace(note, '—', '-'),
      lines = replace(lines::text, '—', '-')::jsonb
  where title like '%—%' or note like '%—%' or lines::text like '%—%';
