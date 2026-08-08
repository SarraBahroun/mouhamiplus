export type CaseStatus = 'open' | 'pending' | 'closed'

export interface CaseDocument {
  id: number
  name: string
  type: string
  addedAt: string
  size: string
}

export interface CaseHearing {
  id: number
  date: string
  court: string
  note: string
}

export interface CaseNote {
  id: number
  author: string
  date: string
  text: string
}

export interface CaseTask {
  id: number
  label: string
  done: boolean
  dueDate: string
}

export type CaseMessageDirection = 'in' | 'out'

export interface CaseMessage {
  id: number
  author: string
  date: string
  text: string
  direction: CaseMessageDirection
}

export interface Case {
  id: number
  reference: string
  title: string
  clientId: number
  status: CaseStatus
  practiceArea: string
  assignedTo: string
  openedAt: string
  nextHearing?: string
  documents: CaseDocument[]
  hearings: CaseHearing[]
  notes: CaseNote[]
  tasks: CaseTask[]
  messages: CaseMessage[]
}

export const CASE_STATUS_META: Record<CaseStatus, { label: string; color: string; bg: string }> = {
  open: { label: 'En cours', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  pending: { label: 'En attente', color: '#E65100', bg: 'rgba(230,81,0,0.08)' },
  closed: { label: 'Clôturé', color: '#37474F', bg: 'rgba(55,71,79,0.08)' },
}

export const initialCases: Case[] = [
  {
    id: 1,
    reference: '2023-041',
    title: 'Affaire Bensalem c/ Société TechTun',
    clientId: 1,
    status: 'open',
    practiceArea: 'Droit des affaires',
    assignedTo: 'Yassine Karray',
    openedAt: '2023-04-02',
    nextHearing: '2024-06-18',
    documents: [
      { id: 1, name: 'Assignation_v3.pdf', type: 'PDF', addedAt: '2024-06-12', size: '124 Ko' },
      { id: 2, name: 'Contrat_initial_2021.pdf', type: 'PDF', addedAt: '2023-04-05', size: '860 Ko' },
      { id: 3, name: 'Echange_courriels.docx', type: 'DOCX', addedAt: '2023-11-18', size: '48 Ko' },
    ],
    hearings: [
      { id: 1, date: '2024-06-18 09:30', court: 'Tribunal de première instance de Tunis', note: 'Audience de plaidoirie' },
      { id: 2, date: '2024-03-04 10:00', court: 'Tribunal de première instance de Tunis', note: 'Mise en état' },
    ],
    notes: [
      { id: 1, author: 'Yassine Karray', date: '2024-06-11 16:47', text: 'Client informé du report. Préparer les conclusions avant le 15/06.' },
      { id: 2, author: 'Me. Amine Trabelsi', date: '2024-05-20 11:02', text: 'Statut passé à "Clôturé" par erreur puis réouvert — vérifier le journal d\'audit.' },
    ],
    tasks: [
      { id: 1, label: 'Déposer les conclusions en réplique', done: false, dueDate: '2024-06-12' },
      { id: 2, label: 'Relancer le client pour les pièces manquantes', done: false, dueDate: '2024-06-14' },
      { id: 3, label: 'Préparer le dossier de plaidoirie', done: true, dueDate: '2024-06-05' },
    ],
    messages: [
      { id: 1, author: 'Karim Bensalem', date: '2024-06-10 08:12', text: 'Bonjour Maître, avez-vous des nouvelles concernant l\'audience du 18 ?', direction: 'in' },
      { id: 2, author: 'Yassine Karray', date: '2024-06-10 14:30', text: 'Bonjour, oui l\'audience est confirmée. Nous préparons les conclusions.', direction: 'out' },
    ],
  },
  {
    id: 2,
    reference: '2023-041-S',
    title: 'Dossier succession Mrad',
    clientId: 3,
    status: 'open',
    practiceArea: 'Droit de la famille',
    assignedTo: 'Me. Amine Trabelsi',
    openedAt: '2023-05-11',
    documents: [
      { id: 1, name: 'Acte_de_deces.pdf', type: 'PDF', addedAt: '2023-05-11', size: '210 Ko' },
      { id: 2, name: 'Inventaire_succession.xlsx', type: 'XLSX', addedAt: '2024-01-09', size: '76 Ko' },
    ],
    hearings: [],
    notes: [
      { id: 1, author: 'Me. Amine Trabelsi', date: '2024-01-09 09:15', text: 'Inventaire des biens finalisé avec la famille.' },
    ],
    tasks: [
      { id: 1, label: 'Finaliser le partage successoral', done: false, dueDate: '2024-06-12' },
    ],
    messages: [],
  },
  {
    id: 3,
    reference: '2024-118',
    title: 'Litige immobilier Gharbi',
    clientId: 4,
    status: 'pending',
    practiceArea: 'Droit immobilier',
    assignedTo: 'Salma Ben Fredj',
    openedAt: '2024-01-20',
    nextHearing: '2024-06-25',
    documents: [
      { id: 1, name: 'Titre_foncier.pdf', type: 'PDF', addedAt: '2024-01-20', size: '340 Ko' },
    ],
    hearings: [
      { id: 1, date: '2024-06-25 11:00', court: 'Tribunal de première instance de Sousse', note: 'Première audience' },
    ],
    notes: [],
    tasks: [
      { id: 1, label: 'Vérifier le cadastre auprès de la conservation foncière', done: false, dueDate: '2024-06-13' },
    ],
    messages: [],
  },
  {
    id: 4,
    reference: '2022-077',
    title: 'Contrat commercial Saïd & Associés',
    clientId: 5,
    status: 'closed',
    practiceArea: 'Droit des affaires',
    assignedTo: 'Yassine Karray',
    openedAt: '2022-10-05',
    documents: [
      { id: 1, name: 'Contrat_signe.pdf', type: 'PDF', addedAt: '2022-11-02', size: '512 Ko' },
    ],
    hearings: [],
    notes: [
      { id: 1, author: 'Yassine Karray', date: '2022-11-02 15:00', text: 'Contrat signé par les deux parties. Dossier clôturé.' },
    ],
    tasks: [],
    messages: [],
  },
  {
    id: 5,
    reference: '2024-032',
    title: 'Arbitrage Compagnie Assur+',
    clientId: 6,
    status: 'open',
    practiceArea: 'Droit des assurances',
    assignedTo: 'Me. Sonia Ben Romdhane',
    openedAt: '2024-02-14',
    nextHearing: '2024-07-02',
    documents: [
      { id: 1, name: 'Police_assurance.pdf', type: 'PDF', addedAt: '2024-02-14', size: '290 Ko' },
      { id: 2, name: 'Expertise_technique.pdf', type: 'PDF', addedAt: '2024-04-18', size: '1,2 Mo' },
    ],
    hearings: [
      { id: 1, date: '2024-07-02 14:00', court: "Centre d'arbitrage de Tunis", note: 'Audience d\'arbitrage' },
    ],
    notes: [],
    tasks: [
      { id: 1, label: 'Synthétiser le rapport d\'expertise', done: false, dueDate: '2024-06-12' },
    ],
    messages: [],
  },
  {
    id: 6,
    reference: '2024-118-P',
    title: 'Dossier pénal Ben Ali',
    clientId: 1,
    status: 'open',
    practiceArea: 'Droit pénal',
    assignedTo: 'Me. Karim Mansour',
    openedAt: '2024-03-01',
    nextHearing: '2024-06-20',
    documents: [
      { id: 1, name: 'Proces_verbal.pdf', type: 'PDF', addedAt: '2024-03-01', size: '150 Ko' },
    ],
    hearings: [
      { id: 1, date: '2024-06-20 09:00', court: 'Tribunal de première instance de Tunis', note: 'Audience de fond' },
    ],
    notes: [],
    tasks: [],
    messages: [],
  },
]

export function getCaseById(id: number): Case | undefined {
  return initialCases.find((c) => c.id === id)
}

export function getCasesByClientId(clientId: number): Case[] {
  return initialCases.filter((c) => c.clientId === clientId)
}
