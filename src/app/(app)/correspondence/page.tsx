'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'
import { useLang } from '@/providers/LangProvider'
import { CaseMessageDirection } from '@/lib/cases-data'

export default function CorrespondencePage() {
  const { showToast } = useToast()
  const { tr } = useLang()
  const { correspondence, cases, addCorrespondence } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ direction: 'out' as CaseMessageDirection, subject: '', recipient: '', caseId: '' })
  const [loading, setLoading] = useState(false)

  const DIRECTION_META: Record<CaseMessageDirection, { label: string; color: string; bg: string }> = {
    out: { label: tr.correspondence_direction_out, color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
    in: { label: tr.correspondence_direction_in, color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  }

  const sentCount = correspondence.filter((l) => l.direction === 'out').length
  const receivedCount = correspondence.filter((l) => l.direction === 'in').length

  const stats = [
    { label: tr.correspondence_stat_sent_label, value: String(sentCount), sub: tr.correspondence_stat_sent_sub, icon: '📤' },
    { label: tr.correspondence_stat_received_label, value: String(receivedCount), sub: tr.correspondence_stat_received_sub, icon: '📥' },
    { label: tr.common_total, value: String(correspondence.length), sub: tr.correspondence_stat_total_sub, icon: '✉️' },
  ]

  const submit = async () => {
    if (!form.subject || !form.recipient) return
    setLoading(true)
    const id = await addCorrespondence({ direction: form.direction, subject: form.subject, recipient: form.recipient, caseId: form.caseId || undefined })
    setLoading(false)
    if (!id) { showToast(tr.correspondence_toast_error); return }
    showToast(tr.correspondence_toast_success)
    setForm({ direction: 'out', subject: '', recipient: '', caseId: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.correspondence_title}</h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.correspondence_subtitle}</p>
          </div>
          <Btn onClick={() => setShowForm((s) => !s)}>{showForm ? tr.common_cancel : `+ ${tr.correspondence_new_title}`}</Btn>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>{tr.correspondence_new_title}</h2>
            <div className="flex flex-col gap-3">
              <SelectInput
                label={tr.correspondence_direction_label}
                value={form.direction}
                onChange={(v) => setForm((p) => ({ ...p, direction: v as CaseMessageDirection }))}
                options={[{ value: 'out', label: tr.correspondence_direction_out }, { value: 'in', label: tr.correspondence_direction_in }]}
              />
              <Input label={tr.correspondence_subject_label} value={form.subject} onChange={(v) => setForm((p) => ({ ...p, subject: v }))} placeholder={tr.correspondence_subject_placeholder} />
              <Input label={tr.correspondence_recipient_label} value={form.recipient} onChange={(v) => setForm((p) => ({ ...p, recipient: v }))} placeholder={tr.correspondence_recipient_placeholder} />
              <SelectInput
                label={tr.billing_case_optional_label}
                value={form.caseId}
                onChange={(v) => setForm((p) => ({ ...p, caseId: v }))}
                options={[{ value: '', label: tr.billing_none_placeholder }, ...cases.map((c) => ({ value: c.id, label: c.title }))]}
              />
              <Btn onClick={submit} disabled={loading || !form.subject || !form.recipient}>{loading ? '…' : tr.common_save}</Btn>
            </div>
          </div>
        )}

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {correspondence.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>{tr.correspondence_empty}</div>
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
