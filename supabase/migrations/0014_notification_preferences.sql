-- Notification toggles on Settings / espace client Profil currently only
-- update local React state and never persist — this backs them for real.
alter table profiles add column notification_preferences jsonb not null
  default '{"email": true, "sms": false, "hearings": true, "invoices": true}'::jsonb;

alter table clients add column notification_preferences jsonb not null
  default '{"email": true, "sms": false}'::jsonb;
