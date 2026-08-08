-- Corrige une récursion infinie RLS : auth_cabinet_id()/auth_client_id() lisent
-- profiles/clients, qui appliquent elles-mêmes une policy appelant ces fonctions.
-- En SECURITY DEFINER, la lecture interne de la fonction bypass RLS (comme prévu),
-- seul le résultat scalaire (cabinet_id / client_id) est renvoyé à l'appelant.

create or replace function auth_cabinet_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select cabinet_id from profiles where id = auth.uid()
$$;

create or replace function auth_client_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from clients where auth_user_id = auth.uid()
$$;
