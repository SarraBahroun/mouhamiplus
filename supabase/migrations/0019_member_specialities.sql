-- Les formulaires de création "Avocat associé" et "Avocat collaborateur" affichent
-- un sélecteur de domaines de spécialité (src/lib/members-data.ts → SPECIALITIES)
-- depuis le début, mais aucune colonne ne l'a jamais stocké : les cases cochées
-- disparaissaient silencieusement à la création du compte.
alter table profiles add column if not exists specialities text[] not null default '{}';
