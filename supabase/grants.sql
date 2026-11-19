-- À exécuter dans Supabase > SQL Editor si l'accès Data API n'était pas accordé automatiquement.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.collection_items to authenticated;
grant select, insert, update, delete on table public.universes to authenticated;
