export type InvoiceStatus = 'paid' | 'pending' | 'overdue'
export type PaymentStatus = 'completed' | 'pending' | 'failed'
export type ContractStatus = 'draft' | 'active' | 'expiring' | 'expired'

export interface Invoice {
  id: number
  number: string
  clientId: number
  caseId?: number
  amount: number
  issuedAt: string
  dueAt: string
  status: InvoiceStatus
}

export interface Payment {
  id: number
  clientId: number
  caseId?: number
  amount: number
  date: string
  method: string
  status: PaymentStatus
}

export interface Contract {
  id: number
  clientId: number
  title: string
  status: ContractStatus
  signedAt?: string
  expiresAt?: string
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  paid: { label: 'Payée', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  pending: { label: 'En attente', color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  overdue: { label: 'En retard', color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  completed: { label: 'Complété', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  pending: { label: 'En attente', color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  failed: { label: 'Échoué', color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
}

export const CONTRACT_STATUS_META: Record<ContractStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Brouillon', color: '#37474F', bg: 'rgba(55,71,79,0.08)' },
  active: { label: 'Actif', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  expiring: { label: 'Expire bientôt', color: '#E65100', bg: 'rgba(230,81,0,0.08)' },
  expired: { label: 'Expiré', color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
}

export const invoices: Invoice[] = [
  { id: 1, number: 'FAC-2024-058', clientId: 1, caseId: 1, amount: 2400, issuedAt: '2024-05-15', dueAt: '2024-06-15', status: 'pending' },
  { id: 2, number: 'FAC-2024-051', clientId: 2, amount: 4800, issuedAt: '2024-04-20', dueAt: '2024-05-20', status: 'overdue' },
  { id: 3, number: 'FAC-2024-047', clientId: 3, caseId: 2, amount: 1500, issuedAt: '2024-04-02', dueAt: '2024-05-02', status: 'paid' },
  { id: 4, number: 'FAC-2024-062', clientId: 5, caseId: 4, amount: 3200, issuedAt: '2024-06-01', dueAt: '2024-07-01', status: 'pending' },
  { id: 5, number: 'FAC-2024-039', clientId: 6, caseId: 5, amount: 6000, issuedAt: '2024-03-10', dueAt: '2024-04-10', status: 'paid' },
]

export const payments: Payment[] = [
  { id: 1, clientId: 3, caseId: 2, amount: 1500, date: '2024-04-28', method: 'Virement bancaire', status: 'completed' },
  { id: 2, clientId: 6, caseId: 5, amount: 6000, date: '2024-04-05', method: 'Chèque', status: 'completed' },
  { id: 3, clientId: 1, caseId: 1, amount: 2400, date: '2024-06-11', method: 'Virement bancaire', status: 'pending' },
  { id: 4, clientId: 2, amount: 4800, date: '2024-05-25', method: 'Carte bancaire', status: 'failed' },
]

export const contracts: Contract[] = [
  { id: 1, clientId: 2, title: 'Convention d\'honoraires — Société TechTun', status: 'active', signedAt: '2021-11-10', expiresAt: '2025-11-10' },
  { id: 2, clientId: 5, title: 'Convention d\'honoraires — Saïd & Associés', status: 'expiring', signedAt: '2022-10-01', expiresAt: '2024-07-01' },
  { id: 3, clientId: 6, title: "Mandat d'arbitrage — Compagnie Assur+", status: 'active', signedAt: '2024-02-14', expiresAt: '2025-02-14' },
  { id: 4, clientId: 4, title: 'Convention d\'honoraires — Fedoua Gharbi', status: 'draft' },
]
