-- Staff can now create a client without an email — portal login then uses
-- a generated identifier instead (see inviteClient in clients/actions.ts).
alter table clients alter column email drop not null;
