'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { INVOICE_STATUS_META, InvoiceStatus } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'

export default function InvoicesPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { invoices, clients, cases, addInvoice, updateInvoiceStatus } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientId: '', caseId: '', amount: '', vatRate: '19', stampDuty: '1', dueAt: '' })
  const [loading, setLoading] = useState(false)
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const ttc = (i: { amount: number; vatRate: number; stampDuty: number }) =>
    i.amount * (1 + i.vatRate / 100) + i.stampDuty

  const total = invoices.reduce((sum, i) => sum + ttc(i), 0)
  const paid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + ttc(i), 0)
  const pending = invoices.filter((i) => i.status === 'pending').reduce((sum, i) => sum + ttc(i), 0)
  const overdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + ttc(i), 0)

  const stats = [
    { label: 'Total facturé (TTC)', value: `${total.toLocaleString('fr-FR')} DT`, sub: `${invoices.length} facture${invoices.length !== 1 ? 's' : ''}`, icon: '📄' },
    { label: 'Payées', value: `${paid.toLocaleString('fr-FR')} DT`, sub: `${invoices.filter((i) => i.status === 'paid').length} facture${invoices.filter((i) => i.status === 'paid').length !== 1 ? 's' : ''}`, icon: '✅' },
    { label: 'En attente', value: `${pending.toLocaleString('fr-FR')} DT`, sub: `${invoices.filter((i) => i.status === 'pending').length} facture${invoices.filter((i) => i.status === 'pending').length !== 1 ? 's' : ''}`, icon: '⏳' },
    { label: 'En retard', value: `${overdue.toLocaleString('fr-FR')} DT`, sub: `${invoices.filter((i) => i.status === 'overdue').length} facture${invoices.filter((i) => i.status === 'overdue').length !== 1 ? 's' : ''}`, icon: '⚠️' },
  ]

  const casesForClient = cases.filter((c) => c.clientId === form.clientId)

  const submit = async () => {
    if (!form.clientId || !form.amount) return
    setLoading(true)
    const number = `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`
    const id = await addInvoice({
      number,
      clientId: form.clientId,
      caseId: form.caseId || undefined,
      amount: Number(form.amount),
      vatRate: Number(form.vatRate) || 0,
      stampDuty: Number(form.stampDuty) || 0,
      dueAt: form.dueAt || undefined,
    })
    setLoading(false)
    if (!id) { showToast('Échec de la création de la facture'); return }
    showToast('Facture créée')
    setForm({ clientId: '', caseId: '', amount: '', vatRate: '19', stampDuty: '1', dueAt: '' })
    setShowForm(false)
  }

  const formTtc = form.amount
    ? Number(form.amount) * (1 + (Number(form.vatRate) || 0) / 100) + (Number(form.stampDuty) || 0)
    : 0

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Factures</h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
              {invoices.length} facture{invoices.length !== 1 ? 's' : ''} · {total.toLocaleString('fr-FR')} DT au total
            </p>
          </div>
          <Btn onClick={() => setShowForm((s) => !s)}>{showForm ? 'Annuler' : '+ Nouvelle facture'}</Btn>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Nouvelle facture</h2>
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
                <Input label="Montant HT (DT)" type="number" value={form.amount} onChange={f('amount')} placeholder="2400" />
                <Input label="Échéance" type="date" value={form.dueAt} onChange={f('dueAt')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Taux TVA (%)" type="number" value={form.vatRate} onChange={f('vatRate')} placeholder="19" />
                <Input label="Timbre fiscal (DT)" type="number" value={form.stampDuty} onChange={f('stampDuty')} placeholder="1" />
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-muted-foreground)', margin: 0 }}>
                Taux par défaut à titre indicatif — à confirmer avec votre comptable selon votre régime (les honoraires d&apos;avocat peuvent relever d&apos;un taux de TVA différent du taux normal).
              </p>
              {form.amount && (
                <p style={{ fontSize: 13, color: 'var(--color-foreground)', margin: 0 }}>
                  Total TTC : <strong>{formTtc.toLocaleString('fr-FR', { maximumFractionDigits: 3 })} DT</strong>
                </p>
              )}
              <Btn onClick={submit} disabled={loading || !form.clientId || !form.amount}>{loading ? '…' : 'Créer la facture'}</Btn>
            </div>
          </div>
        )}

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflowX: 'auto', background: 'var(--color-card)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr 120px',
              minWidth: 620,
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-secondary)',
            }}
          >
            {['N° facture', 'Client', 'Émise le', 'Montant', 'Statut'].map((h) => (
              <span key={h} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </span>
            ))}
          </div>
          {invoices.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>Aucune facture pour le moment</div>
          )}
          {invoices.map((inv, i) => {
            const meta = INVOICE_STATUS_META[inv.status]
            const client = clients.find((c) => c.id === inv.clientId)
            return (
              <div
                key={inv.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr 120px',
                  minWidth: 620,
                  padding: '12px 16px',
                  borderBottom: i < invoices.length - 1 ? '1px solid var(--color-border)' : 'none',
                  alignItems: 'center',
                }}
              >
                <span
                  onClick={() => router.push(`/clients/${inv.clientId}`)}
                  style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)', cursor: 'pointer' }}
                >
                  {inv.number}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{client?.name ?? '—'}</span>
                <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>{new Date(inv.issuedAt).toLocaleDateString('fr-FR')}</span>
                <span
                  title={`HT ${inv.amount.toLocaleString('fr-FR')} DT + TVA ${inv.vatRate}% + timbre ${inv.stampDuty.toLocaleString('fr-FR')} DT`}
                  style={{ fontSize: 13, color: 'var(--color-foreground)', cursor: 'help' }}
                >
                  {ttc(inv).toLocaleString('fr-FR', { maximumFractionDigits: 3 })} DT <span style={{ fontSize: 10, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>TTC</span>
                </span>
                <select
                  value={inv.status}
                  onChange={(e) => updateInvoiceStatus(inv.id, e.target.value as InvoiceStatus)}
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 6px',
                    borderRadius: 3,
                    background: meta.bg,
                    color: meta.color,
                    border: 'none',
                    width: 'fit-content',
                    cursor: 'pointer',
                  }}
                >
                  {(Object.keys(INVOICE_STATUS_META) as InvoiceStatus[]).map((s) => (
                    <option key={s} value={s}>{INVOICE_STATUS_META[s].label}</option>
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
