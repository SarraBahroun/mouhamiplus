-- Abonnement (forfait) & validation de paiement par virement bancaire.
-- Un cabinet démarre en 'pending_payment' (aucun accès au dashboard, cf. code app)
-- jusqu'à ce qu'un admin plateforme valide le justificatif de virement uploadé.

create type subscription_status as enum ('pending_payment', 'pending_review', 'active', 'rejected');

alter table cabinets add column if not exists phone text;
alter table cabinets add column if not exists plan text;
alter table cabinets add column if not exists subscription_status subscription_status not null default 'pending_payment';

-- Les cabinets qui existaient déjà avant l'introduction du paywall ont été
-- validés manuellement (ou sont des comptes de test) : ne pas les bloquer
-- rétroactivement. Seuls les cabinets créés à partir de maintenant démarrent
-- en 'pending_payment'.
update cabinets set subscription_status = 'active' where subscription_status = 'pending_payment';

-- ─────────────────────────────────────────────────────────────
-- Justificatifs de virement bancaire
-- ─────────────────────────────────────────────────────────────
create table payment_receipts (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  plan text not null,
  amount numeric,
  receipt_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index on payment_receipts (cabinet_id);
create index on payment_receipts (status);

alter table payment_receipts enable row level security;

create policy "cabinet_staff_read_own_receipts" on payment_receipts for select using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_insert_own_receipts" on payment_receipts for insert with check (cabinet_id = auth_cabinet_id());

-- ─────────────────────────────────────────────────────────────
-- Administrateurs plateforme (équipe Mouhami+, pas un rôle de cabinet)
-- Aucune ligne par défaut : ajouter manuellement après déploiement, ex.
--   insert into platform_admins (user_id) select id from auth.users where email = 'admin@mouhamiplus.tn';
-- ─────────────────────────────────────────────────────────────
create table platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table platform_admins enable row level security;

create policy "platform_admin_self_read" on platform_admins for select using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Bucket privé pour les photos de justificatif de virement.
-- Convention de chemin : "{cabinet_id}/{uuid}-{nom_original}"
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

create policy "cabinet_staff_upload_own_receipts" on storage.objects for insert with check (
  bucket_id = 'payment-receipts'
  and (storage.foldername(name))[1]::uuid = auth_cabinet_id()
);

create policy "cabinet_staff_read_own_receipt_files" on storage.objects for select using (
  bucket_id = 'payment-receipts'
  and (storage.foldername(name))[1]::uuid = auth_cabinet_id()
);
