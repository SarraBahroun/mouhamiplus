'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/members/Avatar'
import { APPOINTMENT_STATUS_META } from '@/lib/appointment-requests'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'

export default function MessagesPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { cases, clients, appointmentRequests, updateAppointmentRequest } = useAppData()
  const [tab, setTab] = useState<'messages' | 'requests'>('messages')
  const [reschedulingId, setReschedulingId] = useState<string | null>(null)
  const [proposedDate, setProposedDate] = useState('')

  const incomingMessages = cases
    .flatMap((c) => c.messages.filter((m) => m.direction === 'in').map((m) => ({ ...m, case: c })))
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const requests = appointmentRequests
  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const accept = (id: string) => {
    updateAppointmentRequest(id, { status: 'accepted' })
    showToast('Rendez-vous accepté')
  }

  const decline = (id: string) => {
    updateAppointmentRequest(id, { status: 'declined' })
    showToast('Demande refusée')
  }

  const startReschedule = (id: string) => {
    setReschedulingId(id)
    setProposedDate('')
  }

  const confirmReschedule = (id: string) => {
    if (!proposedDate) return
    updateAppointmentRequest(id, { status: 'rescheduled', proposedDate })
    setReschedulingId(null)
    showToast('Nouvel horaire proposé au client')
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Messages & RDV</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Communications et demandes de rendez-vous reçues de vos clients
          </p>
        </div>

        <div style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 0 }}>
          {[
            { id: 'messages' as const, label: 'Messages', count: incomingMessages.length },
            { id: 'requests' as const, label: 'Demandes de rendez-vous', count: pendingCount },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '9px 14px',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                fontWeight: tab === t.id ? 600 : 400,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: tab === t.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                borderBottom: `2px solid ${tab === t.id ? 'var(--color-primary)' : 'transparent'}`,
                marginBottom: -1,
                transition: 'color 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 9,
                    background: tab === t.id ? 'var(--color-primary)' : 'var(--color-muted)',
                    color: tab === t.id ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'messages' && (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
            {incomingMessages.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>Aucun message</div>
            )}
            {incomingMessages.map((m, i) => {
              const client = clients.find((c) => c.id === m.case.clientId)
              return (
                <div key={`${m.case.id}-${m.id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderBottom: i < incomingMessages.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <Avatar initials={(client?.name ?? '??').split(' ').map((w) => w[0]).join('').slice(0, 2)} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{client?.name}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', flexShrink: 0 }}>{m.date}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginBottom: 4 }}>{m.case.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{m.text}</div>
                    <button
                      onClick={() => router.push(`/cases/${m.case.id}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-primary)', fontWeight: 500, padding: 0, marginTop: 6 }}
                    >
                      Voir la conversation →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'requests' && (
          <div className="flex flex-col gap-3">
            {requests.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14, border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-card)' }}>
                Aucune demande de rendez-vous
              </div>
            )}
            {requests.map((r) => {
              const client = clients.find((c) => c.id === r.clientId)
              const meta = APPOINTMENT_STATUS_META[r.status]
              const caseTitle = cases.find((c) => c.id === r.caseId)?.title
              return (
                <div key={r.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '16px 18px' }}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar initials={(client?.name ?? '??').split(' ').map((w) => w[0]).join('').slice(0, 2)} size={30} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{client?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{caseTitle}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-foreground)', margin: '8px 0' }}>{r.note}</p>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                    Souhaité : {r.requestedDate}
                    {r.proposedDate && <> · Proposé : {r.proposedDate}</>}
                  </div>

                  {r.status === 'pending' && reschedulingId !== r.id && (
                    <div className="flex gap-2">
                      <Btn onClick={() => accept(r.id)}>Accepter</Btn>
                      <Btn variant="secondary" onClick={() => startReschedule(r.id)}>Proposer un autre horaire</Btn>
                      <Btn variant="ghost" onClick={() => decline(r.id)}>Refuser</Btn>
                    </div>
                  )}

                  {reschedulingId === r.id && (
                    <div className="flex gap-2 items-end">
                      <div style={{ flex: 1 }}>
                        <Input label="Nouvel horaire proposé" type="datetime-local" value={proposedDate} onChange={setProposedDate} />
                      </div>
                      <Btn onClick={() => confirmReschedule(r.id)} disabled={!proposedDate}>Envoyer</Btn>
                      <Btn variant="ghost" onClick={() => setReschedulingId(null)}>Annuler</Btn>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
