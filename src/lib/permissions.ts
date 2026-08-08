import { MemberRole } from './members-data'

export type PermissionKey =
  | 'viewAllCases'
  | 'createCase'
  | 'editCase'
  | 'deleteCase'
  | 'manageClients'
  | 'viewPayments'
  | 'manageCalendar'
  | 'useAiTools'
  | 'manageDocuments'
  | 'manageUsers'
  | 'accessSettings'

export const PERMISSION_DEFS: { key: PermissionKey; label: string; desc: string }[] = [
  { key: 'viewAllCases', label: 'Voir tous les dossiers', desc: 'Sinon, uniquement les dossiers qui lui sont assignés' },
  { key: 'createCase', label: 'Créer un dossier', desc: 'Ouvrir un nouveau dossier' },
  { key: 'editCase', label: 'Modifier un dossier', desc: 'Éditer les informations d\'un dossier existant' },
  { key: 'deleteCase', label: 'Supprimer un dossier', desc: 'Supprimer définitivement un dossier' },
  { key: 'manageClients', label: 'Gérer les clients', desc: 'Créer, modifier et consulter les fiches clients' },
  { key: 'viewPayments', label: 'Voir les paiements', desc: 'Consulter les factures et paiements' },
  { key: 'manageCalendar', label: 'Gérer le calendrier', desc: 'Créer et modifier des audiences et rendez-vous' },
  { key: 'useAiTools', label: 'Utiliser les outils IA', desc: 'Génération de documents, résumés, assistant juridique' },
  { key: 'manageDocuments', label: 'Gérer les documents', desc: 'Téléverser, classer et supprimer des documents' },
  { key: 'manageUsers', label: 'Gérer les utilisateurs', desc: 'Ajouter, modifier ou désactiver des membres du cabinet' },
  { key: 'accessSettings', label: 'Accéder aux paramètres', desc: 'Modifier les paramètres du cabinet' },
]

export type PermissionSet = Record<PermissionKey, boolean>

function makeSet(on: PermissionKey[]): PermissionSet {
  const set = {} as PermissionSet
  for (const def of PERMISSION_DEFS) {
    set[def.key] = on.includes(def.key)
  }
  return set
}

export const ROLE_DEFAULT_PERMISSIONS: Record<MemberRole, PermissionSet> = {
  owner: makeSet(PERMISSION_DEFS.map((d) => d.key)),
  secretary: makeSet(['manageClients', 'manageCalendar', 'manageDocuments']),
  collaborator: makeSet(['viewAllCases', 'createCase', 'editCase', 'manageClients', 'manageCalendar', 'useAiTools', 'manageDocuments']),
  intern: makeSet([]),
}
