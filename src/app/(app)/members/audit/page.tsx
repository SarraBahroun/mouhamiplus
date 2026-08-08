'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Avatar } from '@/components/members/Avatar'
import { RoleBadge } from '@/components/members/RoleBadge'
import { auditEntries, ACTION_COLORS } from '@/lib/members-data'

export default function MembersAuditPage() {
  const router = useRouter()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [userFilter, setUserFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const users = ['all', ...Array.from(new Set(auditEntries.map((e) => e.user)))]
  const actions = ['all', ...Array.from(new Set(auditEntries.map((e) => e.action)))]

  const filtered = auditEntries.filter((e) => {
    if (userFilter !== 'all' && e.user !== userFilter) return false
    if (actionFilter !== 'all' && e.action !== actionFilter) return false
    if (dateFilter && !e.date.startsWith(dateFilter)) return false
    return true
  })

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
            Journal d&apos;audit
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Traçabilité de toutes les actions effectuées dans le cabinet
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            style={{ padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'var(--color-card)', color: 'var(--color-foreground)', outline: 'none', cursor: 'pointer' }}
          >
            {users.map((u) => <option key={u} value={u}>{u === 'all' ? 'Tous les utilisateurs' : u}</option>)}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'var(--color-card)', color: 'var(--color-foreground)', outline: 'none', cursor: 'pointer' }}
          >
            {actions.map((a) => <option key={a} value={a}>{a === 'all' ? 'Tous les types' : a}</option>)}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'var(--color-card)', color: 'var(--color-foreground)', outline: 'none' }}
          />
          {(userFilter !== 'all' || actionFilter !== 'all' || dateFilter) && (
            <button
              onClick={() => { setUserFilter('all'); setActionFilter('all'); setDateFilter('') }}
              style={{ padding: '7px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'var(--color-secondary)', cursor: 'pointer', color: 'var(--color-muted-foreground)' }}
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Log entries */}
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflowX: 'auto', background: 'var(--color-card)' }}>
          {filtered.map((entry, i) => {
            const ac = ACTION_COLORS[entry.action] || ACTION_COLORS.LECTURE
            const isOpen = expanded === entry.id
            return (
              <div key={entry.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none', minWidth: 560 }}>
                <div
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr auto 90px 28px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    cursor: 'pointer',
                    background: isOpen ? 'rgba(22, 35, 63,0.02)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>
                    {entry.date}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar initials={entry.user.split(' ').map((w) => w[0]).join('').slice(0, 2)} size={24} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.user}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      — {entry.entity}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 3,
                      background: ac.bg,
                      color: ac.color,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.action}
                  </span>
                  <RoleBadge role={entry.userRole} />
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="var(--color-muted-foreground)"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 14px 14px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                    }}
                  >
                    {[
                      { label: 'AVANT', value: entry.detail.before, bg: 'rgba(198,40,40,0.04)', border: 'rgba(198,40,40,0.15)' },
                      { label: 'APRÈS', value: entry.detail.after, bg: 'rgba(46,125,50,0.04)', border: 'rgba(46,125,50,0.15)' },
                    ].map((col) => (
                      <div
                        key={col.label}
                        style={{
                          padding: '10px 12px',
                          background: col.bg,
                          border: `1px solid ${col.border}`,
                          borderRadius: 4,
                        }}
                      >
                        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-muted-foreground)', marginBottom: 4 }}>
                          {col.label}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{col.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>
              Aucune entrée pour ces filtres
            </div>
          )}
        </div>

        <Btn fullWidth variant="ghost" onClick={() => router.push('/members')}>← Retour à la liste</Btn>
      </div>
    </div>
  )
}
