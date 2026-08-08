'use client'

import { use, useRef, useState } from 'react'
import { useRouter, notFound } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { CASE_STATUS_META } from '@/lib/cases-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/providers/ToastProvider'

const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'text/plain',
]

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()
  const { cases, clients, members, toggleCaseTask, addCaseDocument, getDocumentUrl, addCaseNote, addCaseMessage, loading } = useAppData()
  const { currentUserName } = useSession()
  const caseData = cases.find((c) => c.id === id)
  const [tab, setTab] = useState<'info' | 'documents' | 'hearings' | 'notes' | 'tasks' | 'messages'>('info')
  const [noteDraft, setNoteDraft] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (loading) return null
  if (!caseData) notFound()

  const tasks = caseData.tasks
  const notes = caseData.notes
  const messages = caseData.messages
  const client = clients.find((c) => c.id === caseData.clientId)
  const assignee = members.find((m) => m.id === caseData.assignedTo)
  const meta = CASE_STATUS_META[caseData.status]

  const toggleTask = (taskId: string) => toggleCaseTask(caseData.id, taskId)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_DOCUMENT_SIZE) {
      showToast('Fichier trop volumineux (15 Mo max)')
      return
    }
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      showToast('Type de fichier non pris en charge')
      return
    }
    setUploading(true)
    const ok = await addCaseDocument(caseData.id, file)
    setUploading(false)
    showToast(ok ? 'Document ajouté' : "Échec de l'envoi du document")
  }

  const openDocument = async (storagePath: string | null) => {
    if (!storagePath) return
    const url = await getDocumentUrl(storagePath)
    if (url) window.open(url, '_blank')
  }

  const addNote = () => {
    if (!noteDraft.trim()) return
    addCaseNote(caseData.id, currentUserName || 'Moi', noteDraft)
    setNoteDraft('')
  }

  const sendMessage = () => {
    if (!messageDraft.trim()) return
    addCaseMessage(caseData.id, currentUserName || 'Moi', messageDraft, 'out')
    setMessageDraft('')
  }

  const tabs: { id: typeof tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Infos' },
    { id: 'documents', label: 'Documents', count: caseData.documents.length },
    { id: 'hearings', label: 'Audiences', count: caseData.hearings.length },
    { id: 'notes', label: 'Notes', count: notes.length },
    { id: 'tasks', label: 'Tâches', count: tasks.filter((t) => !t.done).length },
    { id: 'messages', label: 'Échanges', count: messages.length },
  ]

  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '20px 22px' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>{caseData.title}</h2>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>Réf. {caseData.reference}</span>
            <span
              style={{ fontSize: 12, color: 'var(--color-primary)', cursor: 'pointer' }}
              onClick={() => router.push(`/clients/${caseData.clientId}`)}
            >
              {client?.name}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{caseData.practiceArea}</span>
            <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>Assigné à {assignee ? `${assignee.firstName} ${assignee.lastName}` : '—'}</span>
            <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
              Ouvert le {new Date(caseData.openedAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
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
              {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Informations du dossier</h3>
              {[
                { label: 'Référence', value: caseData.reference },
                { label: 'Client', value: client?.name ?? '—' },
                { label: 'Domaine', value: caseData.practiceArea },
                { label: 'Avocat assigné', value: assignee ? `${assignee.firstName} ${assignee.lastName}` : '—' },
                { label: 'Statut', value: meta.label },
                { label: 'Date d\'ouverture', value: new Date(caseData.openedAt).toLocaleDateString('fr-FR') },
                { label: 'Prochaine audience', value: caseData.nextHearing ? new Date(caseData.nextHearing).toLocaleDateString('fr-FR') : 'Aucune' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', gap: 12, alignItems: 'baseline', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', minWidth: 140 }}>{row.label}</span>
                  <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'documents' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: 0 }}>Documents</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_DOCUMENT_TYPES.join(',')}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Btn variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Envoi…' : '+ Ajouter un document'}
                </Btn>
              </div>
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
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{new Date(d.addedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'hearings' && (
            <div className="flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Audiences</h3>
              {caseData.hearings.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucune audience programmée.</p>
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

          {tab === 'notes' && (
            <div className="flex flex-col gap-3">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Notes</h3>
              <div className="flex gap-2">
                <input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Ajouter une note…"
                  style={{ flex: 1, padding: '9px 12px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'var(--font-body)', background: 'var(--color-card)', outline: 'none', color: 'var(--color-foreground)' }}
                />
                <Btn onClick={addNote}>Ajouter</Btn>
              </div>
              {notes.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucune note.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4 }}>
                    <div style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{n.author} · {n.date}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'tasks' && (
            <div className="flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Tâches</h3>
              {tasks.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucune tâche.</p>
              ) : (
                tasks.map((t) => (
                  <div key={t.id} onClick={() => toggleTask(t.id)} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <span
                      style={{
                        width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                        border: `1.5px solid ${t.done ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: t.done ? 'var(--color-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {t.done && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span style={{ fontSize: 14, flex: 1, color: 'var(--color-foreground)', textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1 }}>
                      {t.label}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{t.dueDate}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'messages' && (
            <div className="flex flex-col gap-3">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Échanges avec le client</h3>
              <div className="flex flex-col gap-2">
                {messages.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun échange.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.direction === 'out' ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        background: m.direction === 'out' ? 'var(--color-primary)' : 'var(--color-secondary)',
                        color: m.direction === 'out' ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                      }}
                    >
                      <div style={{ fontSize: 13 }}>{m.text}</div>
                      <div style={{ fontSize: 10, marginTop: 3, opacity: 0.75, fontFamily: 'var(--font-mono)' }}>{m.author} · {m.date}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder="Écrire un message…"
                  style={{ flex: 1, padding: '9px 12px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'var(--font-body)', background: 'var(--color-card)', outline: 'none', color: 'var(--color-foreground)' }}
                />
                <Btn onClick={sendMessage}>Envoyer</Btn>
              </div>
            </div>
          )}
        </div>

        <Btn fullWidth variant="ghost" onClick={() => router.push('/cases')}>← Retour à la liste</Btn>
      </div>
    </div>
  )
}
