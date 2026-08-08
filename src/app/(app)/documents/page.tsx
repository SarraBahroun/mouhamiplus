'use client'

import { useState } from 'react'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'

const TYPE_ICON: Record<string, string> = { PDF: '📕', DOCX: '📘', XLSX: '📗' }
const TYPES = ['PDF', 'DOCX', 'XLSX'] as const

export default function DocumentsPage() {
  const { cases, getDocumentUrl } = useAppData()
  const { showToast } = useToast()
  const allDocuments = cases.flatMap((c) => c.documents.map((d) => ({ ...d, caseTitle: c.title, caseId: c.id })))
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = allDocuments.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.caseTitle.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || d.type === typeFilter
    return matchSearch && matchType
  })

  const groups = cases
    .map((c) => ({ caseId: c.id, caseTitle: c.title, docs: filtered.filter((d) => d.caseId === c.id) }))
    .filter((g) => g.docs.length > 0)

  const toggleGroup = (caseId: string) => setCollapsed((prev) => ({ ...prev, [caseId]: !prev[caseId] }))

  const casesWithDocs = new Set(allDocuments.map((d) => d.caseId)).size
  const countByType = (t: string) => allDocuments.filter((d) => d.type === t).length

  const stats = [
    { label: 'Documents au total', value: String(allDocuments.length), sub: `${casesWithDocs} dossier(s) concerné(s)`, icon: '🗂️' },
    { label: 'PDF', value: String(countByType('PDF')), sub: 'fichiers PDF', icon: '📕' },
    { label: 'DOCX', value: String(countByType('DOCX')), sub: 'fichiers Word', icon: '📘' },
    { label: 'XLSX', value: String(countByType('XLSX')), sub: 'fichiers Excel', icon: '📗' },
  ]

  const recentDocuments = [...allDocuments]
    .sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1))
    .slice(0, 6)

  const openDocument = async (storagePath: string | null) => {
    if (!storagePath) return
    const url = await getDocumentUrl(storagePath)
    if (url) window.open(url, '_blank')
    else showToast("Impossible d'ouvrir le document")
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Documents</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {allDocuments.length} documents dans tous les dossiers
          </p>
        </div>

        {/* Stats */}
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

        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document…"
            style={{
              flex: 1,
              padding: '9px 12px',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              background: 'var(--color-card)',
              outline: 'none',
              color: 'var(--color-foreground)',
            }}
          />
          <div className="flex gap-1" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius)', padding: 3, border: '1px solid var(--color-border)' }}>
            {(['all', ...TYPES] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '5px 10px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: typeFilter === t ? 'var(--color-card)' : 'transparent',
                  color: typeFilter === t ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  fontWeight: typeFilter === t ? 600 : 400,
                  boxShadow: typeFilter === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                {t === 'all' ? 'Tous' : t}
              </button>
            ))}
          </div>
        </div>

        {groups.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14, border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-card)' }}>
            Aucun document trouvé
          </div>
        )}

        {groups.map((g) => {
          const isCollapsed = collapsed[g.caseId]
          return (
            <div key={g.caseId} style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
              <div
                onClick={() => toggleGroup(g.caseId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  background: 'var(--color-secondary)',
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.caseTitle}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', flexShrink: 0 }}>({g.docs.length})</span>
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="var(--color-muted-foreground)"
                  style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              {!isCollapsed && g.docs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => openDocument(d.storagePath)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 16px',
                    borderTop: '1px solid var(--color-border)',
                    cursor: d.storagePath ? 'pointer' : 'default',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63,0.02)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <span style={{ fontSize: 18 }}>{TYPE_ICON[d.type] ?? '📄'}</span>
                  <span style={{ fontSize: 14, color: 'var(--color-foreground)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', flexShrink: 0 }}>{d.size}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', minWidth: 76, textAlign: 'right', flexShrink: 0 }}>{d.addedAt}</span>
                </div>
              ))}
            </div>
          )
        })}

        {/* Documents récents */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
            Ajoutés récemment
          </h2>
          {recentDocuments.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Aucun document pour le moment.</p>
          )}
          <div className="flex flex-col gap-0">
            {recentDocuments.map((d, i) => (
              <div
                key={d.id}
                onClick={() => openDocument(d.storagePath)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 0',
                  cursor: d.storagePath ? 'pointer' : 'default',
                  borderBottom: i < recentDocuments.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <span style={{ fontSize: 16 }}>{TYPE_ICON[d.type] ?? '📄'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.caseTitle}</div>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', flexShrink: 0 }}>{d.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
