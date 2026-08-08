'use client'

import { useRouter } from 'next/navigation'
import { CASE_STATUS_META } from '@/lib/cases-data'
import { INVOICE_STATUS_META } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'
import { IconFolder, IconScale, IconCreditCard } from '@/components/ui/icons'

export default function ClientDashboardPage() {
  const router = useRouter()
  const { clientProfile, loading } = useClientSession()
  const { cases: allCases, invoices } = useAppData()

  if (loading) return null
  if (!clientProfile) {
    return <p style={{ padding: 24, fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucune fiche client associée à ce compte pour le moment.</p>
  }

  const client = clientProfile
  const cases = allCases.filter((c) => c.clientId === client.id)
  const openCases = cases.filter((c) => c.status !== 'closed')
  const upcoming = cases
    .filter((c) => c.nextHearing)
    .sort((a, b) => (a.nextHearing! < b.nextHearing! ? -1 : 1))
  const clientInvoices = invoices.filter((i) => i.clientId === client.id)
  const outstanding = clientInvoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

  const stats = [
    { label: 'Dossiers actifs', value: String(openCases.length), sub: `${cases.length} au total`, icon: <IconFolder size={20} /> },
    {
      label: 'Prochain rendez-vous',
      value: upcoming[0] ? new Date(upcoming[0].nextHearing!).toLocaleDateString('fr-FR') : '—',
      sub: upcoming[0]?.title ?? 'Aucun programmé',
      icon: <IconScale size={20} />,
    },
    { label: 'Montant en attente', value: `${outstanding.toLocaleString('fr-FR')} DT`, sub: `${clientInvoices.length} facture${clientInvoices.length !== 1 ? 's' : ''}`, icon: <IconCreditCard size={20} /> },
  ]

  const recentEvents = cases
    .flatMap((c) => c.notes.map((n) => ({ date: n.date, label: n.text, caseTitle: c.title, caseId: c.id })))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 4)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, margin: '0 0 4px' }}>
          Bonjour, {client.name}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', margin: 0 }}>
          Bienvenue dans votre espace client Mouhami+
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '14px 16px', boxShadow: '0 1px 3px rgba(18,21,28,0.04)' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>Mes dossiers</h2>
          <div className="flex flex-col gap-2">
            {cases.map((c) => {
              const meta = CASE_STATUS_META[c.status]
              return (
                <div key={c.id} onClick={() => router.push(`/espace-client/dossiers/${c.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 4, cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-foreground)', flex: 1 }}>{c.title}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>{meta.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>Activité récente</h2>
          <div className="flex flex-col gap-0">
            {recentEvents.length === 0 && <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Aucune activité récente.</p>}
            {recentEvents.map((e, i) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: i < recentEvents.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{e.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{e.caseTitle} · {e.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {clientInvoices.length > 0 && (
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: 0 }}>Mes factures</h2>
            <button onClick={() => router.push('/espace-client/factures')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-primary)' }}>Voir tout →</button>
          </div>
          <div className="flex flex-col gap-2">
            {clientInvoices.map((inv) => {
              const meta = INVOICE_STATUS_META[inv.status]
              return (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 4 }}>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)', flex: 1 }}>{inv.number}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{inv.amount.toLocaleString('fr-FR')} DT</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>{meta.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
