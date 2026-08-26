'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { PAYMENT_STATUS_META, PaymentStatus } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'
import { useLang } from '@/providers/LangProvider'

const METHODS = ['Virement bancaire', 'Chèque', 'Carte bancaire', 'Espèces']

export default function PaymentsPage() {
  const { showToast } = useToast()
  const { tr } = useLang()
  const { payments, clients, cases, addPayment } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientId: '', caseId: '', amount: '', method: METHODS[0], status: 'completed' as PaymentStatus })
  const [loading, setLoading] = useState(false)
  const f = (k: 'clientId' | 'caseId' | 'amount' | 'method') => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const METHOD_LABEL: Record<string, string> = {
    'Virement bancaire': tr.payments_method_bank_transfer,
    'Chèque': tr.payments_method_check,
    'Carte bancaire': tr.payments_method_card,
    'Espèces': tr.payments_method_cash,
  }
  const methodLabel = (m: string) => METHOD_LABEL[m] ?? m

  const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
    completed: tr.payments_status_completed,
    pending: tr.common_pending,
    failed: tr.payments_status_failed,
  }

  const totalCompleted = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const totalFailed = payments.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0)

  const stats = [
    { label: tr.payments_stat_collected_label, value: `${totalCompleted.toLocaleString('fr-FR')} DT`, sub: tr.payments_count_label.replace('{count}', String(payments.filter((p) => p.status === 'completed').length)), icon: '💰' },
    { label: tr.common_pending, value: `${totalPending.toLocaleString('fr-FR')} DT`, sub: tr.payments_count_label.replace('{count}', String(payments.filter((p) => p.status === 'pending').length)), icon: '⏳' },
    { label: tr.payments_stat_failed_label, value: `${totalFailed.toLocaleString('fr-FR')} DT`, sub: tr.payments_count_label.replace('{count}', String(payments.filter((p) => p.status === 'failed').length)), icon: '❌' },
  ]

  const casesForClient = cases.filter((c) => c.clientId === form.clientId)

  const submit = async () => {
    if (!form.clientId || !form.amount) return
    setLoading(true)
    const id = await addPayment({ clientId: form.clientId, caseId: form.caseId || undefined, amount: Number(form.amount), method: form.method, status: form.status })
    setLoading(false)
    if (!id) { showToast(tr.payments_toast_error); return }
    showToast(tr.payments_toast_success)
    setForm({ clientId: '', caseId: '', amount: '', method: METHODS[0], status: 'completed' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.payments_title}</h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
              {tr.payments_subtitle_total.replace('{total}', totalCompleted.toLocaleString('fr-FR'))}
            </p>
          </div>
          <Btn onClick={() => setShowForm((s) => !s)}>{showForm ? tr.common_cancel : `+ ${tr.payments_new_cta_title}`}</Btn>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>{tr.payments_new_form_title}</h2>
            <div className="flex flex-col gap-3">
              <SelectInput
                label={tr.billing_client_label}
                value={form.clientId}
                onChange={(v) => setForm((p) => ({ ...p, clientId: v, caseId: '' }))}
                options={[{ value: '', label: tr.billing_select_client_placeholder }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
              />
              <SelectInput
                label={tr.billing_case_optional_label}
                value={form.caseId}
                onChange={f('caseId')}
                options={[{ value: '', label: tr.billing_none_placeholder }, ...casesForClient.map((c) => ({ value: c.id, label: c.title }))]}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label={tr.payments_amount_label} type="number" value={form.amount} onChange={f('amount')} placeholder="1500" />
                <SelectInput label={tr.payments_method_label} value={form.method} onChange={f('method')} options={METHODS.map((m) => ({ value: m, label: methodLabel(m) }))} />
              </div>
              <SelectInput
                label={tr.common_status}
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v as PaymentStatus }))}
                options={(Object.keys(PAYMENT_STATUS_META) as PaymentStatus[]).map((s) => ({ value: s, label: PAYMENT_STATUS_LABEL[s] }))}
              />
              <Btn onClick={submit} disabled={loading || !form.clientId || !form.amount}>{loading ? '…' : tr.common_save}</Btn>
            </div>
          </div>
        )}

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {payments.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>{tr.payments_empty}</div>
          )}
          {payments.map((p, i) => {
            const meta = PAYMENT_STATUS_META[p.status]
            const client = clients.find((c) => c.id === p.clientId)
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 16px',
                  borderBottom: i < payments.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{client?.name ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{methodLabel(p.method)} · {new Date(p.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{p.amount.toLocaleString('fr-FR')} DT</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>
                  {PAYMENT_STATUS_LABEL[p.status]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
