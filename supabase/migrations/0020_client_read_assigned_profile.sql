-- Aucune policy RLS ne permettait jamais à un client authentifié de lire une ligne
-- `profiles` (la policy `cabinet_staff_all` exige un cabinet_id résolu via
-- auth_cabinet_id(), qui est toujours null pour un client). Résultat concret : sur
-- toutes les pages espace client qui font `members.find(id === case.assignedTo)` pour
-- afficher l'avocat en charge, la recherche échouait systématiquement et affichait
-- "Suivi par —", même quand un avocat est bel et bien assigné.
--
-- On autorise un client à lire uniquement le profil de l'avocat assigné à l'un de ses
-- propres dossiers — pas l'annuaire complet du cabinet.
create policy "client_read_assigned_profiles" on profiles for select using (
  id in (select assigned_to from cases where client_id = auth_client_id() and assigned_to is not null)
);
