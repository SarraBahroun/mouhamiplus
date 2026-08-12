-- Le "Journal d'audit" (src/app/(app)/members/audit/page.tsx) affichait des
-- entrées 100% codées en dur (auditEntries dans src/lib/members-data.ts,
-- explicitement commenté "reste mock pour l'instant"). La table `audit_log`
-- existe depuis 0001 mais rien n'y écrivait jamais.
--
-- Cette migration ajoute un trigger générique qui journalise automatiquement
-- les insert/update/delete sur les objets métier principaux (dossiers,
-- clients, documents, audiences — les mêmes tables déjà couvertes par
-- l'enforcement de permissions en 0009). Utiliser un trigger plutôt que du
-- logging côté application garantit qu'aucune écriture ne passe à travers
-- les mailles du filet, y compris de futurs chemins de code qui oublieraient
-- de logger explicitement.

create or replace function log_audit_event()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_cabinet_id uuid;
  v_action text;
  v_entity text;
  v_before text;
  v_after text;
  v_actor_role member_role;
begin
  select role into v_actor_role from profiles where id = auth.uid();

  if TG_OP = 'INSERT' then
    v_action := 'AJOUT';
  elsif TG_OP = 'UPDATE' then
    v_action := 'MODIFICATION';
  else
    v_action := 'SUPPRESSION';
  end if;

  if TG_TABLE_NAME = 'cases' then
    v_cabinet_id := coalesce(new.cabinet_id, old.cabinet_id);
    v_entity := 'Dossier — ' || coalesce(new.title, old.title);
    if TG_OP = 'UPDATE' and new.status is distinct from old.status then
      v_before := 'Statut : ' || old.status::text;
      v_after := 'Statut : ' || new.status::text;
    end if;

  elsif TG_TABLE_NAME = 'clients' then
    v_cabinet_id := coalesce(new.cabinet_id, old.cabinet_id);
    v_entity := 'Client — ' || coalesce(new.name, old.name);

  elsif TG_TABLE_NAME = 'case_documents' then
    select cabinet_id into v_cabinet_id from cases where id = coalesce(new.case_id, old.case_id);
    v_entity := 'Document — ' || coalesce(new.name, old.name);
    v_after := case when TG_OP = 'INSERT' then coalesce(new.size_label, '') else null end;

  elsif TG_TABLE_NAME = 'case_hearings' then
    select cabinet_id into v_cabinet_id from cases where id = coalesce(new.case_id, old.case_id);
    v_entity := 'Audience — ' || coalesce(new.court, old.court, 'tribunal non précisé');
    v_after := case when TG_OP in ('INSERT', 'UPDATE') then to_char(new.date, 'DD/MM/YYYY HH24:MI') else null end;
  end if;

  if v_cabinet_id is null then
    return coalesce(new, old);
  end if;

  insert into audit_log (cabinet_id, actor_id, actor_role, action, entity, detail_before, detail_after)
  values (v_cabinet_id, auth.uid(), v_actor_role, v_action, v_entity, v_before, v_after);

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_cases on cases;
create trigger trg_audit_cases after insert or update or delete on cases
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_clients on clients;
create trigger trg_audit_clients after insert or update or delete on clients
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_case_documents on case_documents;
create trigger trg_audit_case_documents after insert or update or delete on case_documents
  for each row execute function log_audit_event();

drop trigger if exists trg_audit_case_hearings on case_hearings;
create trigger trg_audit_case_hearings after insert or update or delete on case_hearings
  for each row execute function log_audit_event();

create index if not exists audit_log_created_at_idx on audit_log (cabinet_id, created_at desc);
