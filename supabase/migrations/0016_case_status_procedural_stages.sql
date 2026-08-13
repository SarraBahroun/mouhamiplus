-- The Kanban board only had a generic open/pending/closed status, unrelated
-- to how a case actually moves through the Tunisian court system. Replaced
-- with a general litigation pipeline matching the Tunisian court hierarchy
-- (Tribunal de première instance → Cour d'appel → Cour de cassation).
-- `cases` has 0 rows in production at the time of writing, so no data
-- migration is needed — this recreates the enum outright.

alter table cases alter column status drop default;
alter table cases alter column status type text using status::text;
drop type case_status;

create type case_status as enum (
  'opened',
  'amicable',
  'filed',
  'instruction',
  'pleading',
  'first_instance_judgment',
  'appeal',
  'cassation',
  'execution',
  'closed'
);

alter table cases alter column status type case_status using status::case_status;
alter table cases alter column status set default 'opened';
