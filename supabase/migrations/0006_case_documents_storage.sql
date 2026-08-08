-- Phase 4 : bucket Storage privé pour les pièces jointes de dossiers.
-- Convention de chemin : "{case_id}/{uuid}-{nom_original}" — storage.foldername(name)
-- renvoie ['{case_id}'], ce qui permet de faire correspondre le dossier au cabinet
-- (ou au client) propriétaire sans dupliquer cabinet_id dans le chemin.

insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

create policy "cabinet_staff_case_documents_rw" on storage.objects for all using (
  bucket_id = 'case-documents'
  and (storage.foldername(name))[1]::uuid in (select id from cases where cabinet_id = auth_cabinet_id())
);

create policy "client_read_own_case_documents" on storage.objects for select using (
  bucket_id = 'case-documents'
  and (storage.foldername(name))[1]::uuid in (select id from cases where client_id = auth_client_id())
);
