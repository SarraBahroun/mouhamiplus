'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { CONTRACT_STATUS_META, ContractStatus } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'
import { useLang } from '@/providers/LangProvider'

export default function ContractsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { tr } = useLang()
  const { contracts, clients, addContract, updateContractStatus } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientId: '', title: '', signedAt: '', expiresAt: '' })
  const [loading, setLoading] = useState(false)
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
    draft: tr.contracts_status_draft,
    active: tr.contracts_status_active,
    expiring: tr.contracts_status_expiring,
    expired: tr.contracts_status_expired,
  }

  const active = contracts.filter((c) => c.status === 'active').length
  const expiring = contracts.filter((c) => c.status === 'expiring').length
  const draft = contracts.filter((c) => c.status === 'draft').length

  const stats = [
    { label: tr.contracts_stat_active_label, value: String(active), sub: tr.contracts_stat_active_sub, icon: '✅' },
    { label: tr.contracts_stat_expiring_label, value: String(expiring), sub: tr.contracts_stat_expiring_sub, icon: '⏳' },
    { label: tr.contracts_stat_draft_label, value: String(draft), sub: tr.contracts_stat_draft_sub, icon: '📝' },
    { label: tr.common_total, value: String(contracts.length), sub: tr.contracts_stat_total_sub, icon: '📋' },
  ]

  const submit = async () => {
    if (!form.clientId || !form.title) return
    setLoading(true)
    const id = await addContract({ clientId: form.clientId, title: form.title, signedAt: form.signedAt || undefined, expiresAt: form.expiresAt || undefined })
    setLoading(false)
    if (!id) { showToast(tr.contracts_toast_create_error); return }
    showToast(tr.contracts_toast_create_success)
    setForm({ clientId: '', title: '', signedAt: '', expiresAt: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.contracts_title}</h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
              {tr.contracts_subtitle_count.replace('{count}', String(contracts.length))}
            </p>
          </div>
          <Btn onClick={() => setShowForm((s) => !s)}>{showForm ? tr.common_cancel : `+ ${tr.contracts_new_title}`}</Btn>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>{tr.contracts_new_title}</h2>
            <div className="flex flex-col gap-3">
              <SelectInput
                label={tr.billing_client_label}
                value={form.clientId}
                onChange={f('clientId')}
                options={[{ value: '', label: tr.billing_select_client_placeholder }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
              />
              <Input label={tr.contracts_field_title_label} value={form.title} onChange={f('title')} placeholder={tr.contracts_field_title_placeholder} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label={tr.contracts_field_signed_at_label} type="date" value={form.signedAt} onChange={f('signedAt')} />
                <Input label={tr.contracts_field_expires_at_label} type="date" value={form.expiresAt} onChange={f('expiresAt')} />
              </div>
              <Btn onClick={submit} disabled={loading || !form.clientId || !form.title}>{loading ? '…' : tr.contracts_submit_cta}</Btn>
            </div>
          </div>
        )}

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {contracts.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>{tr.contracts_empty}</div>
          )}
          {contracts.map((c, i) => {
            const meta = CONTRACT_STATUS_META[c.status]
            const client = clients.find((cl) => cl.id === c.clientId)
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 16px',
                  borderBottom: i < contracts.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div onClick={() => router.push(`/clients/${c.clientId}`)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{client?.name ?? '—'}</div>
                </div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>
                  {c.signedAt ? `${tr.contracts_signed_on} ${new Date(c.signedAt).toLocaleDateString('fr-FR')}` : tr.contracts_not_signed}
                </span>
                <select
                  value={c.status}
                  onChange={(e) => updateContractStatus(c.id, e.target.value as ContractStatus)}
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 6px',
                    borderRadius: 3,
                    background: meta.bg,
                    color: meta.color,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {(Object.keys(CONTRACT_STATUS_META) as ContractStatus[]).map((s) => (
                    <option key={s} value={s}>{CONTRACT_STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
