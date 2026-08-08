-- Polish : durcir le bucket documents + exposer l'avocat assigné au client.

-- Limite de taille et types de fichiers autorisés côté serveur (en plus de la
-- validation déjà faite côté client) — 15 Mo, formats bureautiques + images courants.
update storage.buckets
set file_size_limit = 15728640,
    allowed_mime_types = array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'text/plain'
    ]
where id = 'case-documents';

-- "Suivi par —" côté espace client : un client peut lire uniquement le profil
-- de l'avocat assigné à l'un de ses propres dossiers (pas tout le cabinet).
create policy "client_read_assigned_lawyer" on profiles for select using (
  id in (select assigned_to from cases where client_id = auth_client_id())
);
