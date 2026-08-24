-- Depuis l'ajout du rôle "avocat associé" multiple par cabinet, un cabinet peut
-- avoir plusieurs profils role='owner'. La fonction auth_permission() ci-dessous
-- retournait `true` pour un owner AVANT même de regarder permission_overrides,
-- ce qui rendait les permissions personnalisées invisiblement inopérantes sur un
-- owner : un associé pouvait décocher des droits sur un autre associé depuis
-- /members/[id]/permissions, l'enregistrement réussissait, mais l'associé
-- restreint gardait un accès total dès qu'il se connectait lui-même (RLS et
-- l'UI restaient incohérents entre eux — le mode "voir en tant que" respectait
-- déjà l'override, contrairement à la vraie session).
--
-- On inverse l'ordre : un override explicite prime toujours, y compris sur un
-- owner ; le "true" par défaut pour owner ne s'applique que si aucun override
-- n'existe pour ce profil.
create or replace function auth_permission(perm text)
returns boolean
language plpgsql stable security definer set search_path = public
as $$
declare
  my_role member_role;
  override jsonb;
  defaults text[];
begin
  select role into my_role from profiles where id = auth.uid();
  if my_role is null then
    return false;
  end if;

  select permissions into override from permission_overrides where profile_id = auth.uid();
  if override is not null then
    return coalesce((override ->> perm)::boolean, false);
  end if;

  if my_role = 'owner' then
    return true;
  end if;

  case my_role
    when 'secretary' then
      defaults := array['manageClients', 'manageCalendar', 'manageDocuments'];
    when 'collaborator' then
      defaults := array['viewAllCases', 'createCase', 'editCase', 'manageClients', 'manageCalendar', 'useAiTools', 'manageDocuments'];
    else
      defaults := array[]::text[];
  end case;

  return perm = any(defaults);
end;
$$;
