'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { CONTRACT_STATUS_META, ContractStatus } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'

export default function ContractsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { contracts, clients, addContract, updateContractStatus } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientId: '', title: '', signedAt: '', expiresAt: '' })
  const [loading, setLoading] = useState(false)
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const active = contracts.filter((c) => c.status === 'active').length
  const expiring = contracts.filter((c) => c.status === 'expiring').length
  const draft = contracts.filter((c) => c.status === 'draft').length

  const stats = [
    { label: 'Actifs', value: String(active), sub: 'contrats en vigueur', icon: '✅' },
    { label: 'Expirent bientôt', value: String(expiring), sub: 'à renouveler', icon: '⏳' },
    { label: 'Brouillons', value: String(draft), sub: 'non signés', icon: '📝' },
    { label: 'Total', value: String(contracts.length), sub: 'contrats et conventions', icon: '📋' },
  ]

  const submit = async () => {
    if (!form.clientId || !form.title) return
    setLoading(true)
    const id = await addContract({ clientId: form.clientId, title: form.title, signedAt: form.signedAt || undefined, expiresAt: form.expiresAt || undefined })
    setLoading(false)
    if (!id) { showToast('Échec de la création du contrat'); return }
    showToast('Contrat créé')
    setForm({ clientId: '', title: '', signedAt: '', expiresAt: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Contrats</h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
              {contracts.length} contrat{contracts.length !== 1 ? 's' : ''} et convention{contracts.length !== 1 ? 's' : ''} d&apos;honoraires
            </p>
          </div>
          <Btn onClick={() => setShowForm((s) => !s)}>{showForm ? 'Annuler' : '+ Nouveau contrat'}</Btn>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Nouveau contrat</h2>
            <div className="flex flex-col gap-3">
              <SelectInput
                label="Client"
                value={form.clientId}
                onChange={f('clientId')}
                options={[{ value: '', label: '— Sélectionner un client —' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
              />
              <Input label="Intitulé" value={form.title} onChange={f('title')} placeholder="Convention d'honoraires — Nom du client" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Date de signature (optionnel)" type="date" value={form.signedAt} onChange={f('signedAt')} />
                <Input label="Date d'expiration (optionnel)" type="date" value={form.expiresAt} onChange={f('expiresAt')} />
              </div>
              <Btn onClick={submit} disabled={loading || !form.clientId || !form.title}>{loading ? '…' : 'Créer le contrat'}</Btn>
            </div>
          </div>
        )}

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {contracts.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>Aucun contrat pour le moment</div>
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
                  {c.signedAt ? `Signé le ${new Date(c.signedAt).toLocaleDateString('fr-FR')}` : 'Non signé'}
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
                    <option key={s} value={s}>{CONTRACT_STATUS_META[s].label}</option>
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
