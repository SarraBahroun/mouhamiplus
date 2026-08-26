'use client'

import { CASE_STATUS_META } from '@/lib/cases-data'
import { INVOICE_STATUS_META, InvoiceStatus } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useLang } from '@/providers/LangProvider'

function BarChart({ data, unit }: { data: { key: string; label: string; color: string; value: number }[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.key} className="flex items-center gap-3">
          <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', width: 90, flexShrink: 0 }}>{d.label}</span>
          <div style={{ flex: 1, background: 'var(--color-muted)', borderRadius: 4, height: 20, position: 'relative' }}>
            <div
              style={{
                width: `${Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0)}%`,
                height: '100%',
                background: d.color,
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)', width: 90, textAlign: 'right', flexShrink: 0 }}>
            {d.value.toLocaleString('fr-FR')}{unit ?? ''}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const { lang } = useLang()
  const { cases, invoices } = useAppData()
  const caseCounts = (Object.keys(CASE_STATUS_META) as (keyof typeof CASE_STATUS_META)[])
    .map((s) => ({
      key: s,
      label: CASE_STATUS_META[s].label[lang],
      color: CASE_STATUS_META[s].color,
      value: cases.filter((c) => c.status === s).length,
    }))
    .filter((row) => row.value > 0)
  const invoiceAmounts = (['paid', 'pending', 'overdue'] as InvoiceStatus[]).map((s) => ({
    key: s,
    label: INVOICE_STATUS_META[s].label,
    color: INVOICE_STATUS_META[s].color,
    value: invoices.filter((i) => i.status === s).reduce((sum, i) => sum + i.amount, 0),
  }))
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const recoveryRate = totalRevenue + outstanding > 0 ? Math.round((totalRevenue / (totalRevenue + outstanding)) * 100) : 0
  const stats = [
    { label: 'Revenus encaissés', value: `${totalRevenue.toLocaleString('fr-FR')} DT`, icon: '💰' },
    { label: 'Montant en attente', value: `${outstanding.toLocaleString('fr-FR')} DT`, icon: '⏳' },
    { label: 'Taux de recouvrement', value: `${recoveryRate}%`, icon: '📈' },
  ]

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Rapports</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Vue d&apos;ensemble de l&apos;activité du cabinet</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Dossiers par statut</h2>
          {caseCounts.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Aucun dossier.</p>
          ) : (
            <BarChart data={caseCounts} />
          )}
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Facturation par statut</h2>
          <BarChart data={invoiceAmounts} unit=" DT" />
        </div>
      </div>
    </div>
  )
}
