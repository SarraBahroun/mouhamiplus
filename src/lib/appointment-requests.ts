export type AppointmentRequestStatus = 'pending' | 'accepted' | 'rescheduled' | 'declined'

export interface AppointmentRequest {
  id: number
  clientId: number
  caseId: number
  requestedDate: string
  proposedDate?: string
  note: string
  status: AppointmentRequestStatus
  createdAt: string
}

export const APPOINTMENT_STATUS_META: Record<AppointmentRequestStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: '#E65100', bg: 'rgba(230,81,0,0.08)' },
  accepted: { label: 'Accepté', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  rescheduled: { label: 'Nouvel horaire proposé', color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  declined: { label: 'Refusé', color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
}

export const initialAppointmentRequests: AppointmentRequest[] = [
  {
    id: 1,
    clientId: 1,
    caseId: 1,
    requestedDate: '2024-06-19 10:00',
    note: "Souhaite discuter de la stratégie avant l'audience du 18/06.",
    status: 'pending',
    createdAt: '2024-06-11',
  },
  {
    id: 2,
    clientId: 3,
    caseId: 2,
    requestedDate: '2024-06-20 14:00',
    note: 'Signature des documents de partage successoral.',
    status: 'pending',
    createdAt: '2024-06-10',
  },
  {
    id: 3,
    clientId: 4,
    caseId: 3,
    requestedDate: '2024-06-15 09:00',
    proposedDate: '2024-06-16 09:30',
    note: 'Point sur le dossier et les pièces du cadastre.',
    status: 'accepted',
    createdAt: '2024-06-05',
  },
]
