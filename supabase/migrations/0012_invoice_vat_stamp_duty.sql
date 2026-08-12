-- `invoices.amount` était un montant unique sans TVA ni timbre fiscal, alors
-- que la facturation tunisienne l'exige. Les sources disponibles au moment
-- d'écrire cette migration se contredisent sur le taux exact applicable aux
-- honoraires d'avocat (19% "taux normal" selon certaines, 12% "professions
-- libérales" selon d'autres) et le timbre fiscal général est de 1,000 DT par
-- facture depuis la loi de finances 2026 (hors cas particuliers commerce de
-- détail). Faute de certitude, on stocke un taux et un timbre par facture
-- (modifiables à la création, valeurs par défaut usuelles) plutôt que de
-- coder en dur un taux qui pourrait être faux pour telle ou telle situation
-- — à confirmer par le comptable du cabinet.
--
-- `amount` reste le montant HORS TAXES (HT), sémantique inchangée pour ne
-- pas casser les données déjà en place ; vat_rate/stamp_duty complètent avec
-- un TTC calculable.

alter table invoices add column if not exists vat_rate numeric(5, 2) not null default 19;
alter table invoices add column if not exists stamp_duty numeric(6, 3) not null default 1;
