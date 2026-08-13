'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { CaseStatus, CASE_STATUS_META } from '@/lib/cases-data'
import { useAppData, Case } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'

const STATUSES = Object.keys(CASE_STATUS_META) as CaseStatus[]

function KanbanBoard({
  cases,
  clients,
  onDrop,
  onOpen,
}: {
  cases: Case[]
  clients: { id: string; name: string }[]
  onDrop: (caseId: string, status: CaseStatus) => void
  onOpen: (caseId: string) => void
}) {
  const [dragOverStatus, setDragOverStatus] = useState<CaseStatus | null>(null)

  return (
    <div className="flex gap-3" style={{ alignItems: 'start', overflowX: 'auto', paddingBottom: 8 }}>
      {STATUSES.map((status) => {
        const meta = CASE_STATUS_META[status]
        const columnCases = cases.filter((c) => c.status === status)
        return (
          <div
            key={status}
            onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status) }}
            onDragLeave={() => setDragOverStatus((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault()
              setDragOverStatus(null)
              const caseId = e.dataTransfer.getData('text/case-id')
              if (caseId) onDrop(caseId, status)
            }}
            style={{
              background: dragOverStatus === status ? 'rgba(22, 35, 63,0.03)' : 'var(--color-secondary)',
              border: `1px dashed ${dragOverStatus === status ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 6,
              padding: 10,
              minHeight: 120,
              width: 240,
              flexShrink: 0,
              transition: 'background 0.12s, border-color 0.12s',
            }}
          >
            <div className="flex items-start justify-between gap-2" style={{ padding: '2px 4px 10px' }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color, lineHeight: 1.4 }}>
                {meta.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: 2 }}>{columnCases.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {columnCases.map((c) => {
                const client = clients.find((cl) => cl.id === c.clientId)
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/case-id', c.id)}
                    onClick={() => onOpen(c.id)}
                    style={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      padding: '10px 12px',
                      cursor: 'grab',
                      boxShadow: '0 1px 2px rgba(28,20,16,0.04)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)' }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                      Réf. {c.reference}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 4 }}>{client?.name}</div>
                  </div>
                )
              })}
              {columnCases.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', textAlign: 'center', padding: '10px 0', margin: 0 }}>Aucun dossier</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function CasesPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { cases: initialCases, clients, members, updateCaseStatus } = useAppData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all')
  const [view, setView] = useState<'list' | 'board'>('list')

  const handleStatusDrop = async (caseId: string, status: CaseStatus) => {
    const current = initialCases.find((c) => c.id === caseId)
    if (!current || current.status === status) return
    const ok = await updateCaseStatus(caseId, status)
    showToast(ok ? 'Statut mis à jour' : "Impossible de changer le statut (vérifiez vos permissions)")
  }

  const filtered = initialCases.filter((c) => {
    const client = clients.find((cl) => cl.id === c.clientId)
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.reference.toLowerCase().includes(search.toLowerCase()) ||
      (client?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeCount = initialCases.filter((c) => c.status !== 'closed').length
  const closedCount = initialCases.filter((c) => c.status === 'closed').length
  const appealOrAboveCount = initialCases.filter((c) => c.status === 'appeal' || c.status === 'cassation').length

  const stats = [
    { label: 'Dossiers au total', value: String(initialCases.length), sub: 'Tous statuts confondus', icon: '📁' },
    { label: 'Dossiers actifs', value: String(activeCount), sub: 'hors clôturés', icon: '⚖️' },
    { label: 'En appel / cassation', value: String(appealOrAboveCount), sub: 'voies de recours', icon: '📜' },
    { label: CASE_STATUS_META.closed.label, value: String(closedCount), sub: 'dossiers archivés', icon: '✅' },
  ]

  const areaCounts = initialCases.reduce<Record<string, number>>((acc, c) => {
    const area = c.practiceArea || 'Non renseigné'
    acc[area] = (acc[area] ?? 0) + 1
    return acc
  }, {})
  const byArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])
  const maxAreaCount = Math.max(1, ...byArea.map(([, n]) => n))

  const upcoming = initialCases
    .filter((c) => c.nextHearing)
    .sort((a, b) => (a.nextHearing! < b.nextHearing! ? -1 : 1))
    .slice(0, 5)

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
              Dossiers
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
              {initialCases.filter((c) => c.status !== 'closed').length} dossiers en cours · {initialCases.length} au total
            </p>
          </div>
          <Btn onClick={() => router.push('/cases/add')}>+ Nouveau dossier</Btn>
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

        {/* Search + filter */}
        <div className="flex gap-3">
          <div style={{ flex: 1, position: 'relative' }}>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="var(--color-muted-foreground)"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un dossier, une référence, un client…"
              style={{
                width: '100%',
                padding: '9px 12px 9px 30px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                background: 'var(--color-card)',
                outline: 'none',
                color: 'var(--color-foreground)',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'all')}
            style={{ padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'var(--color-card)', color: 'var(--color-foreground)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">Tous les statuts</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{CASE_STATUS_META[s].label}</option>
            ))}
          </select>
          <div className="flex gap-1" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius)', padding: 3, border: '1px solid var(--color-border)' }}>
            {([{ id: 'list', label: '☰ Liste' }, { id: 'board', label: '▦ Tableau' }] as const).map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                style={{
                  padding: '5px 10px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: view === v.id ? 'var(--color-card)' : 'transparent',
                  color: view === v.id ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  fontWeight: view === v.id ? 600 : 400,
                  boxShadow: view === v.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.12s',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {view === 'board' && (
          <KanbanBoard cases={filtered} clients={clients} onDrop={handleStatusDrop} onOpen={(id) => router.push(`/cases/${id}`)} />
        )}

        {/* Table */}
        {view === 'list' && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflowX: 'auto', background: 'var(--color-card)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1.4fr 1fr 90px 120px',
              minWidth: 680,
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-secondary)',
            }}
          >
            {['Dossier', 'Client', 'Avocat', 'Statut', 'Prochaine audience'].map((h) => (
              <span key={h} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </span>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>
              Aucun dossier trouvé
            </div>
          )}
          {filtered.map((c, i) => {
            const meta = CASE_STATUS_META[c.status]
            const client = clients.find((cl) => cl.id === c.clientId)
            const assignee = members.find((m) => m.id === c.assignedTo)
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/cases/${c.id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 1.4fr 1fr 90px 120px',
                  minWidth: 680,
                  padding: '12px 16px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63,0.02)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>Réf. {c.reference} · {c.practiceArea}</div>
                </div>
                <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{client?.name}</span>
                <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{assignee ? `${assignee.firstName} ${assignee.lastName}` : '—'}</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color, width: 'fit-content' }}>
                  {meta.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                  {c.nextHearing ? new Date(c.nextHearing).toLocaleDateString('fr-FR') : '—'}
                </span>
              </div>
            )
          })}
        </div>
        )}

        {/* Répartition + prochaines audiences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
              Répartition par domaine
            </h2>
            {byArea.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Aucune donnée.</p>
            )}
            <div className="flex flex-col gap-3">
              {byArea.map(([area, count]) => (
                <div key={area}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{area}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{count}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--color-secondary)', overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxAreaCount) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
              Prochaines audiences
            </h2>
            {upcoming.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Aucune audience programmée.</p>
            )}
            <div className="flex flex-col gap-0">
              {upcoming.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => router.push(`/cases/${c.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    cursor: 'pointer',
                    borderBottom: i < upcoming.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', minWidth: 90 }}>
                    {new Date(c.nextHearing!).toLocaleDateString('fr-FR')}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--color-foreground)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{clients.find((cl) => cl.id === c.clientId)?.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
