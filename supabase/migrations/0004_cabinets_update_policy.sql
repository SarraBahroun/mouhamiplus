-- Le schéma initial ne définissait qu'une policy SELECT sur `cabinets`
-- ("cabinet_staff_read") : toute UPDATE (ex. Paramètres → nom/adresse du
-- cabinet) était donc silencieusement bloquée par RLS (0 ligne affectée,
-- mais PostgREST renvoie quand même 204 sans .select() pour le révéler).
-- Seul le owner peut modifier les infos du cabinet.

create policy "cabinet_owner_update" on cabinets for update using (
  id = auth_cabinet_id()
  and exists (select 1 from profiles where id = auth.uid() and role = 'owner')
);
