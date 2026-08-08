'use client'

import { useRouter } from 'next/navigation'
import { CASE_STATUS_META } from '@/lib/cases-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'

export default function ClientCasesPage() {
  const router = useRouter()
  const { clientProfile } = useClientSession()
  const { cases: allCases, members } = useAppData()
  const cases = allCases.filter((c) => c.clientId === clientProfile?.id)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Mes dossiers</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {cases.length} dossier{cases.length !== 1 ? 's' : ''} confié{cases.length !== 1 ? 's' : ''} au cabinet
          </p>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {cases.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>Aucun dossier pour le moment</div>
          )}
          {cases.map((c, i) => {
            const meta = CASE_STATUS_META[c.status]
            const assignee = members.find((m) => m.id === c.assignedTo)
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/espace-client/dossiers/${c.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < cases.length - 1 ? '1px solid var(--color-border)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63, 0.02)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-foreground)' }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                    Réf. {c.reference} · {c.practiceArea} · Suivi par {assignee ? `${assignee.firstName} ${assignee.lastName}` : '—'}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                  {c.nextHearing ? `Prochaine audience : ${new Date(c.nextHearing).toLocaleDateString('fr-FR')}` : ''}
                </span>
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
