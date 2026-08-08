-- Mouhami+ — schéma initial
-- À exécuter dans Supabase → SQL Editor (ou via `supabase db push` si tu utilises la CLI).
-- Reflète le modèle de données actuellement en dur dans src/lib/*.ts et src/providers/AppDataProvider.tsx.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Types
-- ─────────────────────────────────────────────────────────────
create type member_role as enum ('owner', 'secretary', 'collaborator', 'intern');
create type member_status as enum ('active', 'inactive');
create type client_type as enum ('individual', 'company');
create type case_status as enum ('open', 'pending', 'closed');
create type message_direction as enum ('in', 'out');
create type invoice_status as enum ('paid', 'pending', 'overdue');
create type payment_status as enum ('completed', 'pending', 'failed');
create type contract_status as enum ('draft', 'active', 'expiring', 'expired');
create type appointment_status as enum ('pending', 'accepted', 'rescheduled', 'declined');
create type notification_audience as enum ('cabinet', 'client');

-- ─────────────────────────────────────────────────────────────
-- Cabinets (tenants) & équipe
-- ─────────────────────────────────────────────────────────────
create table cabinets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tax_id text,
  city text,
  size text,
  created_at timestamptz not null default now()
);

-- Un profil par membre du cabinet (1:1 avec auth.users).
-- Créé par la Server Action d'inscription en même temps que le cabinet — pas de trigger automatique,
-- car cabinet_id n'existe pas encore au moment du signup.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  role member_role not null default 'collaborator',
  email text not null,
  phone text,
  status member_status not null default 'active',
  supervisor_id uuid references profiles(id),
  avatar text,
  joined_at timestamptz not null default now(),
  last_active timestamptz not null default now()
);

create table permission_overrides (
  profile_id uuid primary key references profiles(id) on delete cascade,
  permissions jsonb not null default '{}'::jsonb
);

-- ─────────────────────────────────────────────────────────────
-- Clients (peuvent aussi se connecter à l'espace client via auth_user_id)
-- ─────────────────────────────────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  type client_type not null default 'individual',
  email text not null,
  phone text,
  address text,
  city text,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Dossiers
-- ─────────────────────────────────────────────────────────────
create table cases (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  reference text not null,
  title text not null,
  client_id uuid not null references clients(id) on delete cascade,
  status case_status not null default 'open',
  practice_area text,
  assigned_to uuid references profiles(id),
  opened_at timestamptz not null default now(),
  next_hearing timestamptz
);

create table case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  name text not null,
  type text,
  size_label text,
  storage_path text,
  added_at timestamptz not null default now()
);

create table case_hearings (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  date timestamptz not null,
  court text,
  note text
);

create table case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  author_id uuid references profiles(id),
  author_label text,
  date timestamptz not null default now(),
  text text not null
);

create table case_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  due_date date
);

create table case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  author_label text,
  date timestamptz not null default now(),
  text text not null,
  direction message_direction not null
);

-- ─────────────────────────────────────────────────────────────
-- Finance
-- ─────────────────────────────────────────────────────────────
create table invoices (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  number text not null,
  client_id uuid not null references clients(id),
  case_id uuid references cases(id),
  amount numeric(12, 2) not null,
  issued_at date not null default current_date,
  due_at date,
  status invoice_status not null default 'pending'
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  client_id uuid not null references clients(id),
  case_id uuid references cases(id),
  amount numeric(12, 2) not null,
  date date not null default current_date,
  method text,
  status payment_status not null default 'pending'
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  client_id uuid not null references clients(id),
  title text not null,
  status contract_status not null default 'draft',
  signed_at date,
  expires_at date
);

-- ─────────────────────────────────────────────────────────────
-- Rendez-vous & notifications
-- ─────────────────────────────────────────────────────────────
create table appointment_requests (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  case_id uuid references cases(id),
  requested_date timestamptz not null,
  proposed_date timestamptz,
  note text,
  status appointment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  audience notification_audience not null,
  recipient_profile_id uuid references profiles(id),
  recipient_client_id uuid references clients(id),
  text text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Journal d'audit
-- ─────────────────────────────────────────────────────────────
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  actor_id uuid references profiles(id),
  actor_role member_role,
  action text not null,
  entity text not null,
  detail_before text,
  detail_after text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Index
-- ─────────────────────────────────────────────────────────────
create index on profiles (cabinet_id);
create index on clients (cabinet_id);
create index on cases (cabinet_id);
create index on cases (client_id);
create index on invoices (cabinet_id);
create index on payments (cabinet_id);
create index on contracts (cabinet_id);
create index on appointment_requests (cabinet_id);
create index on notifications (cabinet_id);
create index on audit_log (cabinet_id);

-- ─────────────────────────────────────────────────────────────
-- Fonctions utilitaires pour les policies RLS
-- ─────────────────────────────────────────────────────────────
create or replace function auth_cabinet_id()
returns uuid
language sql stable
as $$
  select cabinet_id from profiles where id = auth.uid()
$$;

create or replace function auth_client_id()
returns uuid
language sql stable
as $$
  select id from clients where auth_user_id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table cabinets enable row level security;
alter table profiles enable row level security;
alter table permission_overrides enable row level security;
alter table clients enable row level security;
alter table cases enable row level security;
alter table case_documents enable row level security;
alter table case_hearings enable row level security;
alter table case_notes enable row level security;
alter table case_tasks enable row level security;
alter table case_messages enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table contracts enable row level security;
alter table appointment_requests enable row level security;
alter table notifications enable row level security;
alter table audit_log enable row level security;

-- Équipe du cabinet : accès complet, limité à leur propre cabinet
create policy "cabinet_staff_read" on cabinets for select using (id = auth_cabinet_id());
create policy "cabinet_staff_all" on profiles for all using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_all" on permission_overrides for all using (
  profile_id in (select id from profiles where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_all" on clients for all using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_all" on cases for all using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_all" on case_documents for all using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_all" on case_hearings for all using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_all" on case_notes for all using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_all" on case_tasks for all using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_all" on case_messages for all using (
  case_id in (select id from cases where cabinet_id = auth_cabinet_id())
);
create policy "cabinet_staff_all" on invoices for all using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_all" on payments for all using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_all" on contracts for all using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_all" on appointment_requests for all using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_all" on notifications for all using (cabinet_id = auth_cabinet_id());
create policy "cabinet_staff_read" on audit_log for select using (cabinet_id = auth_cabinet_id());

-- Espace client : accès restreint à leurs propres données
create policy "client_read_own" on clients for select using (id = auth_client_id());
create policy "client_read_own_cases" on cases for select using (client_id = auth_client_id());
create policy "client_read_own_documents" on case_documents for select using (
  case_id in (select id from cases where client_id = auth_client_id())
);
create policy "client_read_own_hearings" on case_hearings for select using (
  case_id in (select id from cases where client_id = auth_client_id())
);
create policy "client_read_own_messages" on case_messages for select using (
  case_id in (select id from cases where client_id = auth_client_id())
);
create policy "client_send_message" on case_messages for insert with check (
  direction = 'in' and case_id in (select id from cases where client_id = auth_client_id())
);
create policy "client_read_own_invoices" on invoices for select using (client_id = auth_client_id());
create policy "client_read_own_payments" on payments for select using (client_id = auth_client_id());
create policy "client_read_own_contracts" on contracts for select using (client_id = auth_client_id());
create policy "client_own_appointments" on appointment_requests for all using (client_id = auth_client_id())
  with check (client_id = auth_client_id());
create policy "client_own_notifications" on notifications for all using (recipient_client_id = auth_client_id());
