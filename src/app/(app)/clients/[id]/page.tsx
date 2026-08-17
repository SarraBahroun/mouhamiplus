'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, notFound } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Avatar } from '@/components/members/Avatar'
import { CASE_STATUS_META } from '@/lib/cases-data'
import { INVOICE_STATUS_META, PAYMENT_STATUS_META } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'
import { inviteClient, resetClientPassword } from '../actions'

function initialsOf(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()
  const { clients, cases: allCases, members, invoices, payments, refresh, loading } = useAppData()
  const client = clients.find((c) => c.id === id)
  const [tab, setTab] = useState<'info' | 'cases' | 'history' | 'documents' | 'payments' | 'appointments'>('info')
  const [inviting, setInviting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [revealedAccess, setRevealedAccess] = useState<{ login: string; tempPassword: string; emailed: boolean } | null>(null)

  useEffect(() => {
    const key = `mouhamiplus-client-access-${id}`
    const stored = sessionStorage.getItem(key)
    if (stored) {
      try {
        setRevealedAccess(JSON.parse(stored))
      } catch {
        // ignore malformed entry
      }
      sessionStorage.removeItem(key)
    }
  }, [id])

  if (loading) return null
  if (!client) notFound()

  const sendPortalAccess = async () => {
    setInviting(true)
    const result = await inviteClient(client.id)
    setInviting(false)
    if ('error' in result) {
      showToast(result.error)
      return
    }
    setRevealedAccess({ login: result.loginId ?? client.email ?? '', tempPassword: result.tempPassword, emailed: result.emailed })
    await refresh()
  }

  const resetPassword = async () => {
    setResetting(true)
    const result = await resetClientPassword(client.id)
    setResetting(false)
    if ('error' in result) {
      showToast(result.error)
      return
    }
    setRevealedAccess({ login: result.loginEmail, tempPassword: result.tempPassword, emailed: result.emailed })
  }

  const cases = allCases.filter((c) => c.clientId === client.id)
  const clientInvoices = invoices.filter((i) => i.clientId === client.id)
  const clientPayments = payments.filter((p) => p.clientId === client.id)
  const documents = cases.flatMap((c) => c.documents.map((d) => ({ ...d, caseTitle: c.title, caseId: c.id })))
  const appointments = cases
    .flatMap((c) => c.hearings.map((h) => ({ ...h, caseTitle: c.title, caseId: c.id })))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  type HistoryEvent = { date: string; label: string; caseTitle: string }
  const history: HistoryEvent[] = [
    ...cases.flatMap((c) => c.notes.map((n) => ({ date: n.date, label: `Note — ${n.text}`, caseTitle: c.title }))),
    ...cases.flatMap((c) => c.documents.map((d) => ({ date: d.addedAt, label: `Document ajouté — ${d.name}`, caseTitle: c.title }))),
    ...cases.flatMap((c) => c.hearings.map((h) => ({ date: h.date, label: `Audience — ${h.note}`, caseTitle: c.title }))),
  ].sort((a, b) => (a.date < b.date ? 1 : -1))

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'info', label: 'Infos' },
    { id: 'cases', label: 'Dossiers' },
    { id: 'history', label: 'Historique' },
    { id: 'documents', label: 'Documents' },
    { id: 'payments', label: 'Paiements' },
    { id: 'appointments', label: 'Rendez-vous' },
  ]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '20px 22px',
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <Avatar initials={initialsOf(client.name)} size={56} />
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>
                {client.name}
              </h2>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 7px', background: client.type === 'company' ? 'rgba(21,101,192,0.08)' : 'rgba(22, 35, 63,0.08)', color: client.type === 'company' ? '#1565C0' : 'var(--color-primary)', borderRadius: 3 }}>
                {client.type === 'company' ? 'Entreprise' : 'Particulier'}
              </span>
            </div>
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{client.email || '—'}</span>
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{client.phone}</span>
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{client.address}, {client.city}</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>
                Client depuis le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>
                Actif {new Date(client.lastActivity).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Identifiants générés — toujours affichés ici, même si un email a aussi été envoyé */}
        {revealedAccess && (
          <div style={{ padding: '14px 16px', border: '1px solid var(--color-primary)', borderRadius: 6, background: 'rgba(22, 35, 63,0.04)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)' }}>
              Accès {revealedAccess.emailed ? 'créé — également envoyé au client par email' : 'créé — à transmettre au client à la main'}
              {' '}(ne sera plus affiché après fermeture)
            </p>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>Identifiant : <strong>{revealedAccess.login}</strong></div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>Mot de passe : <strong>{revealedAccess.tempPassword}</strong></div>
            <div>
              <Btn variant="secondary" onClick={() => setRevealedAccess(null)}>J&apos;ai noté les informations</Btn>
            </div>
          </div>
        )}

        {/* Accès espace client */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-card)' }}>
          <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>
            {client.hasPortalAccess ? '✅ Accès à l\'espace client activé' : "Pas encore d'accès à l'espace client"}
          </span>
          {client.hasPortalAccess ? (
            <Btn variant="secondary" onClick={resetPassword} disabled={resetting}>
              {resetting ? '…' : 'Réinitialiser le mot de passe'}
            </Btn>
          ) : (
            <Btn variant="secondary" onClick={sendPortalAccess} disabled={inviting}>
              {inviting ? '…' : "Envoyer un accès à l'espace client"}
            </Btn>
          )}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '9px 14px',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                fontWeight: tab === t.id ? 600 : 400,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: tab === t.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                borderBottom: `2px solid ${tab === t.id ? 'var(--color-primary)' : 'transparent'}`,
                marginBottom: -1,
                transition: 'color 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Informations générales</h3>
              {[
                { label: 'Type', value: client.type === 'company' ? 'Entreprise' : 'Particulier' },
                { label: 'Email', value: client.email || '—' },
                { label: 'Téléphone', value: client.phone },
                { label: 'Adresse', value: `${client.address}, ${client.city}` },
                { label: 'Client depuis', value: new Date(client.createdAt).toLocaleDateString('fr-FR') },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', gap: 12, alignItems: 'baseline', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', minWidth: 130 }}>{row.label}</span>
                  <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'cases' && (
            <div className="flex flex-col gap-3">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>
                {cases.length} dossier{cases.length !== 1 ? 's' : ''}
              </h3>
              {cases.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun dossier pour ce client.</p>
              ) : (
                cases.map((c) => {
                  const meta = CASE_STATUS_META[c.status]
                  const assignee = members.find((m) => m.id === c.assignedTo)
                  return (
                    <div
                      key={c.id}
                      onClick={() => router.push(`/cases/${c.id}`)}
                      style={{ padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>Réf. {c.reference} · {assignee ? `${assignee.firstName} ${assignee.lastName}` : '—'}</div>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Historique</h3>
              {history.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun événement enregistré.</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '9px 0', borderBottom: i < history.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', minWidth: 100, flexShrink: 0 }}>{h.date}</span>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{h.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 1 }}>{h.caseTitle}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'documents' && (
            <div className="flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </h3>
              {documents.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun document.</p>
              ) : (
                documents.map((d) => (
                  <div key={`${d.caseId}-${d.id}`} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '2px 6px', background: 'var(--color-secondary)', borderRadius: 3, color: 'var(--color-muted-foreground)' }}>{d.type}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>{d.caseTitle} · {d.size}</div>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{d.addedAt}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'payments' && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Factures</h3>
                {clientInvoices.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucune facture.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {clientInvoices.map((inv) => {
                      const meta = INVOICE_STATUS_META[inv.status]
                      return (
                        <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4 }}>
                          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)', flex: 1 }}>{inv.number}</span>
                          <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{inv.amount.toLocaleString('fr-FR')} DT</span>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>{meta.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Paiements</h3>
                {clientPayments.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun paiement.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {clientPayments.map((p) => {
                      const meta = PAYMENT_STATUS_META[p.status]
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4 }}>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', flex: 1 }}>{p.date} · {p.method}</span>
                          <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{p.amount.toLocaleString('fr-FR')} DT</span>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>{meta.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'appointments' && (
            <div className="flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Rendez-vous & audiences</h3>
              {appointments.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun rendez-vous programmé.</p>
              ) : (
                appointments.map((a) => (
                  <div key={`${a.caseId}-${a.id}`} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', minWidth: 130 }}>{a.date}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{a.note}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>{a.court} · {a.caseTitle}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Btn fullWidth variant="ghost" onClick={() => router.push('/clients')}>← Retour à la liste</Btn>
      </div>
    </div>
  )
}
