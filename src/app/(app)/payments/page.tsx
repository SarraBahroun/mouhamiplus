'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { PAYMENT_STATUS_META, PaymentStatus } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'

const METHODS = ['Virement bancaire', 'Chèque', 'Carte bancaire', 'Espèces']

export default function PaymentsPage() {
  const { showToast } = useToast()
  const { payments, clients, cases, addPayment } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientId: '', caseId: '', amount: '', method: METHODS[0], status: 'completed' as PaymentStatus })
  const [loading, setLoading] = useState(false)
  const f = (k: 'clientId' | 'caseId' | 'amount' | 'method') => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const totalCompleted = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const totalFailed = payments.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0)

  const stats = [
    { label: 'Encaissé', value: `${totalCompleted.toLocaleString('fr-FR')} DT`, sub: `${payments.filter((p) => p.status === 'completed').length} paiement(s)`, icon: '💰' },
    { label: 'En attente', value: `${totalPending.toLocaleString('fr-FR')} DT`, sub: `${payments.filter((p) => p.status === 'pending').length} paiement(s)`, icon: '⏳' },
    { label: 'Échoués', value: `${totalFailed.toLocaleString('fr-FR')} DT`, sub: `${payments.filter((p) => p.status === 'failed').length} paiement(s)`, icon: '❌' },
  ]

  const casesForClient = cases.filter((c) => c.clientId === form.clientId)

  const submit = async () => {
    if (!form.clientId || !form.amount) return
    setLoading(true)
    const id = await addPayment({ clientId: form.clientId, caseId: form.caseId || undefined, amount: Number(form.amount), method: form.method, status: form.status })
    setLoading(false)
    if (!id) { showToast('Échec de l\'enregistrement du paiement'); return }
    showToast('Paiement enregistré')
    setForm({ clientId: '', caseId: '', amount: '', method: METHODS[0], status: 'completed' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Paiements</h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
              {totalCompleted.toLocaleString('fr-FR')} DT encaissés au total
            </p>
          </div>
          <Btn onClick={() => setShowForm((s) => !s)}>{showForm ? 'Annuler' : '+ Enregistrer un paiement'}</Btn>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Nouveau paiement</h2>
            <div className="flex flex-col gap-3">
              <SelectInput
                label="Client"
                value={form.clientId}
                onChange={(v) => setForm((p) => ({ ...p, clientId: v, caseId: '' }))}
                options={[{ value: '', label: '— Sélectionner un client —' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
              />
              <SelectInput
                label="Dossier (optionnel)"
                value={form.caseId}
                onChange={f('caseId')}
                options={[{ value: '', label: '— Aucun —' }, ...casesForClient.map((c) => ({ value: c.id, label: c.title }))]}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Montant (DT)" type="number" value={form.amount} onChange={f('amount')} placeholder="1500" />
                <SelectInput label="Méthode" value={form.method} onChange={f('method')} options={METHODS.map((m) => ({ value: m, label: m }))} />
              </div>
              <SelectInput
                label="Statut"
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v as PaymentStatus }))}
                options={(Object.keys(PAYMENT_STATUS_META) as PaymentStatus[]).map((s) => ({ value: s, label: PAYMENT_STATUS_META[s].label }))}
              />
              <Btn onClick={submit} disabled={loading || !form.clientId || !form.amount}>{loading ? '…' : 'Enregistrer'}</Btn>
            </div>
          </div>
        )}

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {payments.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>Aucun paiement pour le moment</div>
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
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{p.method} · {new Date(p.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{p.amount.toLocaleString('fr-FR')} DT</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
