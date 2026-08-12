-- Jusqu'ici, le système de permissions (src/lib/permissions.ts) n'était appliqué
-- que côté UI (masquage du menu latéral dans AppShell.tsx). Rien ne l'appliquait
-- réellement : toutes les policies RLS "cabinet_staff_all" n'exigeaient qu'un
-- cabinet_id correspondant, pas un rôle ou une permission — un stagiaire sans
-- aucune permission pouvait donc lire/écrire/supprimer n'importe quoi dans le
-- cabinet via un appel direct à l'API, en contournant simplement l'UI.
--
-- Cette migration ajoute une fonction auth_permission(perm) qui recalcule côté
-- base la même logique que ROLE_DEFAULT_PERMISSIONS + permission_overrides
-- (src/lib/permissions.ts) — À GARDER SYNCHRONISÉE avec ce fichier si les
-- permissions par défaut y changent — puis remplace les policies "for all" par
-- des policies distinctes (select toujours ouvert au cabinet, insert/update/
-- delete conditionnés à la permission requise) sur les tables où une permission
-- nommée existe déjà côté produit : cases, case_documents, case_hearings, clients.
--
-- Pour `profiles`, la lecture/écriture de ses propres infos (nom, téléphone…)
-- doit rester libre pour tout le monde ; seul un changement de role/status
-- (élévation de privilège ou activation/désactivation d'un autre membre) est
-- désormais bloqué sans la permission manageUsers, via un trigger (RLS ne peut
-- pas comparer facilement l'ancienne et la nouvelle valeur d'une colonne).

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
  if my_role = 'owner' then
    return true;
  end if;

  select permissions into override from permission_overrides where profile_id = auth.uid();
  if override is not null then
    return coalesce((override ->> perm)::boolean, false);
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

grant execute on function auth_permission(text) to authenticated;

-- ── permission_overrides ─────────────────────────────────────────────────
-- Faille directe : n'importe quel membre du cabinet pouvait upsert sa PROPRE
-- ligne (ou celle d'un collègue) dans cette table via le client normal et
-- s'auto-attribuer n'importe quelle permission — seul manageUsers doit
-- pouvoir écrire ici.
drop policy if exists "cabinet_staff_all" on permission_overrides;

create policy "cabinet_staff_select" on permission_overrides for select using (
  profile_id in (select id from profiles where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_insert" on permission_overrides for insert with check (
  profile_id in (select id from profiles where cabinet_id = auth_cabinet_id()) and auth_permission('manageUsers')
);
create policy "cabinet_staff_update" on permission_overrides for update using (
  profile_id in (select id from profiles where cabinet_id = auth_cabinet_id()) and auth_permission('manageUsers')
) with check (
  profile_id in (select id from profiles where cabinet_id = auth_cabinet_id()) and auth_permission('manageUsers')
);
create policy "cabinet_staff_delete" on permission_overrides for delete using (
  profile_id in (select id from profiles where cabinet_id = auth_cabinet_id()) and auth_permission('manageUsers')
);

-- ── cases ────────────────────────────────────────────────────────────────
drop policy if exists "cabinet_staff_all" on cases;

create policy "cabinet_staff_select" on cases for select using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_insert" on cases for insert with check (
  cabinet_id = auth_cabinet_id() and auth_permission('createCase')
);
create policy "cabinet_staff_update" on cases for update using (
  cabinet_id = auth_cabinet_id() and auth_permission('editCase')
) with check (
  cabinet_id = auth_cabinet_id() and auth_permission('editCase')
);
create policy "cabinet_staff_delete" on cases for delete using (
  cabinet_id = auth_cabinet_id() and auth_permission('deleteCase')
);

-- ── case_documents ───────────────────────────────────────────────────────
drop policy if exists "cabinet_staff_all" on case_documents;

create policy "cabinet_staff_select" on case_documents for select using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_insert" on case_documents for insert with check (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id()) and auth_permission('manageDocuments')
);
create policy "cabinet_staff_update" on case_documents for update using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id()) and auth_permission('manageDocuments')
) with check (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id()) and auth_permission('manageDocuments')
);
create policy "cabinet_staff_delete" on case_documents for delete using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id()) and auth_permission('manageDocuments')
);

-- ── case_hearings ────────────────────────────────────────────────────────
drop policy if exists "cabinet_staff_all" on case_hearings;

create policy "cabinet_staff_select" on case_hearings for select using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_insert" on case_hearings for insert with check (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id()) and auth_permission('manageCalendar')
);
create policy "cabinet_staff_update" on case_hearings for update using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id()) and auth_permission('manageCalendar')
) with check (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id()) and auth_permission('manageCalendar')
);
create policy "cabinet_staff_delete" on case_hearings for delete using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id()) and auth_permission('manageCalendar')
);

-- ── clients ──────────────────────────────────────────────────────────────
-- (les policies "client_read_own" et "client_update_own" du client lui-même,
-- ajoutées en 0001/0005, restent inchangées et s'ajoutent à celles-ci)
drop policy if exists "cabinet_staff_all" on clients;

create policy "cabinet_staff_select" on clients for select using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_insert" on clients for insert with check (
  cabinet_id = auth_cabinet_id() and auth_permission('manageClients')
);
create policy "cabinet_staff_update" on clients for update using (
  cabinet_id = auth_cabinet_id() and auth_permission('manageClients')
) with check (
  cabinet_id = auth_cabinet_id() and auth_permission('manageClients')
);
create policy "cabinet_staff_delete" on clients for delete using (
  cabinet_id = auth_cabinet_id() and auth_permission('manageClients')
);

-- ── storage : documents de dossier ──────────────────────────────────────
drop policy if exists "cabinet_staff_case_documents_rw" on storage.objects;

create policy "cabinet_staff_case_documents_read" on storage.objects for select using (
  bucket_id = 'case-documents'
  and (storage.foldername(name))[1]::uuid in (select id from cases where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_case_documents_write" on storage.objects for insert with check (
  bucket_id = 'case-documents'
  and (storage.foldername(name))[1]::uuid in (select id from cases where cabinet_id = auth_cabinet_id())
  and auth_permission('manageDocuments')
);
create policy "cabinet_staff_case_documents_delete" on storage.objects for delete using (
  bucket_id = 'case-documents'
  and (storage.foldername(name))[1]::uuid in (select id from cases where cabinet_id = auth_cabinet_id())
  and auth_permission('manageDocuments')
);

-- ── profiles : anti-élévation de privilège ─────────────────────────────
-- Chacun peut modifier ses propres nom/téléphone/etc. librement (déjà permis
-- par "cabinet_staff_all" for all, inchangée). Ce trigger bloque en plus tout
-- changement de role/status qui ne vient pas d'un owner ou d'un titulaire de
-- manageUsers — sinon un simple stagiaire pourrait s'auto-promouvoir owner,
-- ou désactiver un collègue, via un appel API direct.
create or replace function forbid_unprivileged_role_status_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- Les actions serveur (admin.auth.admin.*, inserts/updates via service_role)
  -- contournent volontairement ce garde-fou : elles font déjà leur propre
  -- vérification de permission côté application avant d'utiliser la clé
  -- service_role (voir inviteMember/inviteClient).
  if auth.role() = 'service_role' then
    return new;
  end if;

  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and not auth_permission('manageUsers') then
    raise exception 'insufficient_permission: manageUsers required to change role or status';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_forbid_unprivileged_role_status_change on profiles;
create trigger trg_forbid_unprivileged_role_status_change
  before update on profiles
  for each row
  execute function forbid_unprivileged_role_status_change();
