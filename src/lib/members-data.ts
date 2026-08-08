export type MemberRole = 'owner' | 'secretary' | 'collaborator' | 'intern'
export type MemberStatus = 'active' | 'inactive'

export const ROLE_META: Record<MemberRole, { label: string; color: string; bg: string; desc: string }> = {
  owner: {
    label: 'Avocat associé',
    color: '#12151C',
    bg: 'rgba(18,21,28,0.08)',
    desc: 'Accès complet au cabinet — finance, membres, paramètres et tous les dossiers.',
  },
  secretary: {
    label: 'Secrétaire',
    color: '#1565C0',
    bg: 'rgba(21,101,192,0.08)',
    desc: 'Gestion administrative, agenda et correspondances. Pas de finance ni IA.',
  },
  collaborator: {
    label: 'Collaborateur',
    color: '#2E7D32',
    bg: 'rgba(46,125,50,0.08)',
    desc: 'Accès aux dossiers partagés, rédaction et consultation. Finance optionnelle.',
  },
  intern: {
    label: 'Stagiaire',
    color: '#E65100',
    bg: 'rgba(230,81,0,0.08)',
    desc: 'Accès limité sous supervision obligatoire. Aucun accès finance ou IA.',
  },
}

export const SPECIALITIES = [
  'Droit des affaires', 'Droit pénal', 'Droit de la famille', 'Droit immobilier',
  'Droit du travail', 'Droit administratif', 'Droit fiscal', 'Propriété intellectuelle',
]

// Journal d'audit — reste mock pour l'instant (voir Phase 2 du plan de migration).
export const auditEntries = [
  { id: 1, date: '2024-06-12 14:32', user: 'Amine Trabelsi', userRole: 'collaborator' as MemberRole, action: 'MODIFICATION', entity: 'Dossier Bensalem c/ TechTun', detail: { before: 'Statut: En cours', after: 'Statut: Clôturé' } },
  { id: 2, date: '2024-06-12 11:15', user: 'Nadia Chaouachi', userRole: 'secretary' as MemberRole, action: 'AJOUT', entity: 'Document — Assignation_v3.pdf', detail: { before: '—', after: 'Fichier ajouté (124 Ko)' } },
  { id: 3, date: '2024-06-11 16:47', user: 'Yassine Karray', userRole: 'collaborator' as MemberRole, action: 'EXPORT', entity: 'Dossier succession Mrad', detail: { before: '—', after: 'Export PDF généré' } },
  { id: 4, date: '2024-06-11 09:03', user: 'Amine Trabelsi', userRole: 'collaborator' as MemberRole, action: 'SUPPRESSION', entity: 'Note interne #47', detail: { before: 'Note: "Audience reportée au 18/06"', after: 'Supprimée' } },
  { id: 5, date: '2024-06-10 17:28', user: 'Salma Ben Fredj', userRole: 'intern' as MemberRole, action: 'LECTURE', entity: 'Dossier litige immobilier Gharbi', detail: { before: '—', after: 'Consultation (8 min)' } },
  { id: 6, date: '2024-06-10 10:11', user: 'Nadia Chaouachi', userRole: 'secretary' as MemberRole, action: 'MODIFICATION', entity: 'Agenda — Rendez-vous client', detail: { before: '15/06 à 10h00', after: '16/06 à 14h30' } },
]

export const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
  MODIFICATION: { color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  AJOUT: { color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  EXPORT: { color: '#6A1B9A', bg: 'rgba(106,27,154,0.08)' },
  SUPPRESSION: { color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
  LECTURE: { color: '#37474F', bg: 'rgba(55,71,79,0.08)' },
}
