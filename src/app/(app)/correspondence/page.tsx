'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'
import { CaseMessageDirection } from '@/lib/cases-data'

const DIRECTION_META: Record<CaseMessageDirection, { label: string; color: string; bg: string }> = {
  out: { label: 'Envoyé', color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  in: { label: 'Reçu', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
}

export default function CorrespondencePage() {
  const { showToast } = useToast()
  const { correspondence, cases, addCorrespondence } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ direction: 'out' as CaseMessageDirection, subject: '', recipient: '', caseId: '' })
  const [loading, setLoading] = useState(false)

  const sentCount = correspondence.filter((l) => l.direction === 'out').length
  const receivedCount = correspondence.filter((l) => l.direction === 'in').length

  const stats = [
    { label: 'Envoyés', value: String(sentCount), sub: 'courriers sortants', icon: '📤' },
    { label: 'Reçus', value: String(receivedCount), sub: 'courriers entrants', icon: '📥' },
    { label: 'Total', value: String(correspondence.length), sub: 'depuis le début', icon: '✉️' },
  ]

  const submit = async () => {
    if (!form.subject || !form.recipient) return
    setLoading(true)
    const id = await addCorrespondence({ direction: form.direction, subject: form.subject, recipient: form.recipient, caseId: form.caseId || undefined })
    setLoading(false)
    if (!id) { showToast('Échec de l\'enregistrement du courrier'); return }
    showToast('Courrier enregistré')
    setForm({ direction: 'out', subject: '', recipient: '', caseId: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Courriers</h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Correspondance envoyée et reçue</p>
          </div>
          <Btn onClick={() => setShowForm((s) => !s)}>{showForm ? 'Annuler' : '+ Nouveau courrier'}</Btn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '14px 16px', boxShadow: '0 1px 3px rgba(28,20,16,0.04)' }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-foreground)', marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px', maxWidth: 480 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Nouveau courrier</h2>
            <div className="flex flex-col gap-3">
              <SelectInput
                label="Sens"
                value={form.direction}
                onChange={(v) => setForm((p) => ({ ...p, direction: v as CaseMessageDirection }))}
                options={[{ value: 'out', label: 'Envoyé' }, { value: 'in', label: 'Reçu' }]}
              />
              <Input label="Objet" value={form.subject} onChange={(v) => setForm((p) => ({ ...p, subject: v }))} placeholder="Mise en demeure — ..." />
              <Input label="Destinataire / Expéditeur" value={form.recipient} onChange={(v) => setForm((p) => ({ ...p, recipient: v }))} placeholder="Nom du client ou de la partie adverse" />
              <SelectInput
                label="Dossier (optionnel)"
                value={form.caseId}
                onChange={(v) => setForm((p) => ({ ...p, caseId: v }))}
                options={[{ value: '', label: '— Aucun —' }, ...cases.map((c) => ({ value: c.id, label: c.title }))]}
              />
              <Btn onClick={submit} disabled={loading || !form.subject || !form.recipient}>{loading ? '…' : 'Enregistrer'}</Btn>
            </div>
          </div>
        )}

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {correspondence.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>Aucun courrier pour le moment</div>
          )}
          {correspondence.map((l, i) => {
            const meta = DIRECTION_META[l.direction]
            const caseTitle = cases.find((c) => c.id === l.caseId)?.title
            return (
              <div
                key={l.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 16px',
                  borderBottom: i < correspondence.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color, flexShrink: 0 }}>
                  {meta.label}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{l.subject}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{l.recipient}{caseTitle ? ` · ${caseTitle}` : ''}</div>
                </div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', flexShrink: 0 }}>
                  {new Date(l.sentAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
