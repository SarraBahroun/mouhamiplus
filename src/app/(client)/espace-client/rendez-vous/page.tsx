'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { Btn } from '@/components/ui/Btn'
import { APPOINTMENT_STATUS_META } from '@/lib/appointment-requests'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'

export default function ClientAppointmentsPage() {
  const { showToast } = useToast()
  const { clientProfile } = useClientSession()
  const { cases: allCases, appointmentRequests, addAppointmentRequest } = useAppData()
  const cases = allCases.filter((c) => c.clientId === clientProfile?.id)
  const requests = appointmentRequests.filter((r) => r.clientId === clientProfile?.id)
  const [caseId, setCaseId] = useState(String(cases[0]?.id ?? ''))
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  const upcomingHearings = cases
    .filter((c) => c.nextHearing)
    .map((c) => ({ date: c.nextHearing!, caseTitle: c.title }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  const submit = () => {
    if (!caseId || !date || !clientProfile) return
    addAppointmentRequest({ clientId: clientProfile.id, caseId, requestedDate: date, note })
    setDate('')
    setNote('')
    showToast('Votre demande de rendez-vous a été envoyée')
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Mes rendez-vous</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Audiences programmées et demandes de rendez-vous
          </p>
        </div>

        {upcomingHearings.length > 0 && (
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>Audiences à venir</h2>
            <div className="flex flex-col gap-2">
              {upcomingHearings.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', minWidth: 100 }}>
                    {new Date(h.date).toLocaleDateString('fr-FR')}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{h.caseTitle}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Demander un rendez-vous</h2>
          <div className="flex flex-col gap-4">
            <SelectInput
              label="Dossier concerné"
              value={caseId}
              onChange={setCaseId}
              options={cases.map((c) => ({ value: String(c.id), label: c.title }))}
            />
            <Input label="Date et heure souhaitées" type="datetime-local" value={date} onChange={setDate} />
            <Input label="Motif du rendez-vous" value={note} onChange={setNote} placeholder="Ex. Point sur l'avancement du dossier" />
            <Btn onClick={submit} disabled={!caseId || !date}>Envoyer la demande</Btn>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 10px' }}>Mes demandes</h2>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
            {requests.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>Aucune demande pour le moment</div>
            )}
            {requests.map((r, i) => {
              const meta = APPOINTMENT_STATUS_META[r.status]
              const c = cases.find((c) => c.id === r.caseId)
              return (
                <div key={r.id} style={{ padding: '13px 16px', borderBottom: i < requests.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{c?.title ?? 'Dossier'}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color, flexShrink: 0 }}>
                      {meta.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{r.note}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    Souhaité : {r.requestedDate}
                    {r.proposedDate && <> · Proposé par le cabinet : {r.proposedDate}</>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
