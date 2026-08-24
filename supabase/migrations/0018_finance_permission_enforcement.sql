-- Complète 0009_permission_enforcement.sql : cases/case_documents/case_hearings/clients
-- avaient été durcis, mais invoices, payments, contracts et correspondence étaient
-- restés sur la policy d'origine "cabinet_staff_all" (0001/0003) : accès complet
-- (lecture/écriture/suppression) pour N'IMPORTE QUEL membre du cabinet, y compris un
-- stagiaire dont ROLE_DEFAULT_PERMISSIONS.intern ne donne aucun droit par défaut.
-- Le menu latéral (AppShell.tsx) masque déjà ces 4 sections derrière la permission
-- 'viewPayments' — cette migration applique enfin la même règle côté base, comme le
-- reste du produit le suppose déjà.
--
-- audit_log : la page /members/audit est masquée derrière 'manageUsers' côté UI, mais
-- la policy RLS "cabinet_staff_read" ne vérifiait aucune permission — n'importe quel
-- membre pouvait lire le journal d'audit complet du cabinet via un appel direct à
-- l'API. Alignée sur la même permission que le menu.

-- ── invoices ─────────────────────────────────────────────────────────────
drop policy if exists "cabinet_staff_all" on invoices;

create policy "cabinet_staff_select" on invoices for select using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_insert" on invoices for insert with check (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_update" on invoices for update using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
) with check (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_delete" on invoices for delete using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);

-- ── payments ─────────────────────────────────────────────────────────────
drop policy if exists "cabinet_staff_all" on payments;

create policy "cabinet_staff_select" on payments for select using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_insert" on payments for insert with check (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_update" on payments for update using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
) with check (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_delete" on payments for delete using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);

-- ── contracts ────────────────────────────────────────────────────────────
drop policy if exists "cabinet_staff_all" on contracts;

create policy "cabinet_staff_select" on contracts for select using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_insert" on contracts for insert with check (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_update" on contracts for update using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
) with check (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_delete" on contracts for delete using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);

-- ── correspondence ───────────────────────────────────────────────────────
drop policy if exists "cabinet_staff_all" on correspondence;

create policy "cabinet_staff_select" on correspondence for select using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_insert" on correspondence for insert with check (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_update" on correspondence for update using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
) with check (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);
create policy "cabinet_staff_delete" on correspondence for delete using (
  cabinet_id = auth_cabinet_id() and auth_permission('viewPayments')
);

-- ── audit_log ────────────────────────────────────────────────────────────
drop policy if exists "cabinet_staff_read" on audit_log;

create policy "cabinet_staff_select" on audit_log for select using (
  cabinet_id = auth_cabinet_id() and auth_permission('manageUsers')
);
