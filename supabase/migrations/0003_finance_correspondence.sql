-- Phase 2 : table correspondence (courriers) + colonne adresse du cabinet
-- (le formulaire Paramètres l'attend, absente du schéma initial).

alter table cabinets add column if not exists address text;

create table correspondence (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  case_id uuid references cases(id) on delete cascade,
  direction message_direction not null,
  subject text not null,
  recipient text not null,
  sent_at timestamptz not null default now()
);

create index on correspondence (cabinet_id);

alter table correspondence enable row level security;

create policy "cabinet_staff_all" on correspondence for all using (cabinet_id = auth_cabinet_id());
