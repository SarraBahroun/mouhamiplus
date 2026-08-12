-- `cases.practice_area` était une colonne text libre : l'UI (cases/add) la
-- contraignait déjà via un <select> alimenté par SPECIALITIES
-- (src/lib/members-data.ts), mais rien n'empêchait un appel API direct d'y
-- mettre n'importe quelle valeur, et la liste elle-même était courte et pas
-- toujours alignée sur la pratique juridique tunisienne (ex. "Droit de la
-- famille" plutôt que "Statut personnel", pas d'arbitrage, pas de droit
-- bancaire...).
--
-- Aucun dossier n'existe encore en production (table vide), donc on peut
-- ajouter la contrainte sans migration de données. À GARDER SYNCHRONISÉE avec
-- SPECIALITIES dans src/lib/members-data.ts si la liste évolue.

alter table cases add constraint cases_practice_area_check check (
  practice_area is null or practice_area in (
    'Droit civil',
    'Droit pénal',
    'Droit commercial et des affaires',
    'Droit des sociétés',
    'Droit du travail et sécurité sociale',
    'Statut personnel et succession',
    'Droit immobilier et foncier',
    'Droit administratif',
    'Droit fiscal',
    'Droit des assurances',
    'Droit bancaire',
    'Propriété intellectuelle',
    'Arbitrage et médiation',
    'Contentieux et recouvrement'
  )
);
