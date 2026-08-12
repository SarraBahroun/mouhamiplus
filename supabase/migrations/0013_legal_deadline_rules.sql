-- Structure pour le futur moteur de délais légaux tunisiens. Volontairement
-- SANS nombre de jours pré-rempli pour les délais procéduraux (appel,
-- cassation, tierce opposition, requête civile) : les recherches faites au
-- moment d'écrire cette migration donnaient des chiffres contradictoires
-- d'une source à l'autre. `days` reste donc NULL et `verified` à false tant
-- qu'un juriste du cabinet n'a pas confirmé la valeur exacte sur le texte
-- officiel du CPCC (https://www.jurisitetunisie.com/tunisie/codes/cpcc/menu.html)
-- — la référence d'article est pré-remplie pour faciliter cette vérification.
--
-- Table globale (pas de cabinet_id) : ce sont des faits de droit tunisien,
-- pas des données propres à un cabinet. Lecture ouverte à tout utilisateur
-- authentifié, écriture réservée à qui a la permission accessSettings
-- (réutilise auth_permission() de la migration 0009).

create table legal_deadline_rules (
  id uuid primary key default gen_random_uuid(),
  recourse_type text not null,
  cpcc_reference text,
  trigger_event text not null,
  days integer,
  verified boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table legal_deadline_rules enable row level security;

create policy "authenticated_read" on legal_deadline_rules for select using (auth.role() = 'authenticated');
create policy "access_settings_write" on legal_deadline_rules for all using (
  auth_permission('accessSettings')
) with check (
  auth_permission('accessSettings')
);

insert into legal_deadline_rules (recourse_type, cpcc_reference, trigger_event, note) values
  ('Appel (matière civile)', 'CPCC, art. 130 à 155', 'Signification du jugement', 'Délai à confirmer — les sources trouvées se contredisaient (souvent cité : 20 jours, +30 jours si la partie perdante est hors de Tunisie le jour de la signification).'),
  ('Pourvoi en cassation', 'CPCC, art. 175 à 197', 'Signification de l''arrêt d''appel', 'Délai à confirmer sur le texte officiel avant utilisation.'),
  ('Tierce opposition', 'CPCC, art. 168 à 174', 'Connaissance du jugement par le tiers', 'Délai à confirmer sur le texte officiel avant utilisation.'),
  ('Requête civile (recours en rétractation)', 'CPCC, art. 156 à 167', 'Signification du jugement ou découverte du motif', 'Délai à confirmer sur le texte officiel avant utilisation.');
