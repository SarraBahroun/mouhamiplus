'use client'

import { use, useState } from 'react'
import { useRouter, notFound } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { CASE_STATUS_META } from '@/lib/cases-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'
import { useToast } from '@/providers/ToastProvider'

export default function ClientCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { clientProfile, loading: clientLoading } = useClientSession()
  const { cases, members, addCaseMessage, getDocumentUrl, loading: dataLoading } = useAppData()
  const { showToast } = useToast()
  const caseData = cases.find((c) => c.id === id)
  const [tab, setTab] = useState<'info' | 'documents' | 'hearings' | 'messages'>('info')
  const [draft, setDraft] = useState('')

  if (clientLoading || dataLoading) return null
  if (!caseData || !clientProfile || caseData.clientId !== clientProfile.id) notFound()

  const messages = caseData.messages
  const meta = CASE_STATUS_META[caseData.status]
  const assignee = members.find((m) => m.id === caseData.assignedTo)

  const send = () => {
    if (!draft.trim()) return
    addCaseMessage(caseData.id, clientProfile.name, draft, 'in')
    setDraft('')
  }

  const openDocument = async (storagePath: string | null) => {
    if (!storagePath) return
    const url = await getDocumentUrl(storagePath)
    if (url) window.open(url, '_blank')
    else showToast("Impossible d'ouvrir le document")
  }

  const tabs: { id: typeof tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Infos' },
    { id: 'documents', label: 'Documents', count: caseData.documents.length },
    { id: 'hearings', label: 'Rendez-vous', count: caseData.hearings.length },
    { id: 'messages', label: 'Échanges', count: messages.length },
  ]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="flex flex-col gap-5">
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '20px 22px' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>{caseData.title}</h2>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>{meta.label}</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>Réf. {caseData.reference}</span>
            <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{caseData.practiceArea}</span>
            <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>Suivi par {assignee ? `${assignee.firstName} ${assignee.lastName}` : '—'}</span>
          </div>
        </div>

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
              {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
            </button>
          ))}
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Informations</h3>
              {[
                { label: 'Référence', value: caseData.reference },
                { label: 'Domaine', value: caseData.practiceArea },
                { label: 'Avocat en charge', value: assignee ? `${assignee.firstName} ${assignee.lastName}` : '—' },
                { label: 'Statut', value: meta.label },
                { label: "Date d'ouverture", value: new Date(caseData.openedAt).toLocaleDateString('fr-FR') },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', gap: 12, alignItems: 'baseline', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', minWidth: 140 }}>{row.label}</span>
                  <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'documents' && (
            <div className="flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Documents</h3>
              {caseData.documents.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun document.</p>
              ) : (
                caseData.documents.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => openDocument(d.storagePath)}
                    style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10, cursor: d.storagePath ? 'pointer' : 'default' }}
                  >
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '2px 6px', background: 'var(--color-secondary)', borderRadius: 3, color: 'var(--color-muted-foreground)' }}>{d.type}</span>
                    <span style={{ fontSize: 14, color: 'var(--color-foreground)', flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>{d.size}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'hearings' && (
            <div className="flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Rendez-vous & audiences</h3>
              {caseData.hearings.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun rendez-vous programmé.</p>
              ) : (
                caseData.hearings.map((h) => (
                  <div key={h.id} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', minWidth: 130 }}>{h.date}</span>
                    <div>
                      <div style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{h.note}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>{h.court}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'messages' && (
            <div className="flex flex-col gap-3">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Échanges avec votre avocat</h3>
              <div className="flex flex-col gap-2">
                {messages.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun échange pour le moment.</p>
                ) : (
                  messages.map((m) => {
                    const isMine = m.direction === 'in'
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: isMine ? 'var(--color-primary)' : 'var(--color-secondary)',
                          color: isMine ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                        }}
                      >
                        <div style={{ fontSize: 13 }}>{m.text}</div>
                        <div style={{ fontSize: 10, marginTop: 3, opacity: 0.75, fontFamily: 'var(--font-mono)' }}>{m.author} · {m.date}</div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Écrire à votre avocat…"
                  style={{ flex: 1, padding: '9px 12px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'var(--font-body)', background: 'var(--color-card)', outline: 'none', color: 'var(--color-foreground)' }}
                />
                <Btn onClick={send}>Envoyer</Btn>
              </div>
            </div>
          )}
        </div>

        <Btn fullWidth variant="ghost" onClick={() => router.push('/espace-client/dossiers')}>← Retour à mes dossiers</Btn>
      </div>
    </div>
  )
}
