'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Avatar } from '@/components/members/Avatar'
import { RoleBadge } from '@/components/members/RoleBadge'
import { StatusDot } from '@/components/members/StatusDot'
import { MemberRole, ROLE_META } from '@/lib/members-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/providers/ToastProvider'

export default function MembersListPage() {
  const router = useRouter()
  const { members, cases, toggleMemberStatus } = useAppData()
  const { hasPermission } = useSession()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all')

  const filtered = members.filter((m) => {
    const matchSearch =
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || m.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
              Membres du cabinet
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
              {members.filter((m) => m.status === 'active').length} membres actifs · {members.length} au total
            </p>
          </div>
          <Btn onClick={() => router.push('/members/add')}>+ Ajouter un membre</Btn>
        </div>

        {/* Search + Filter */}
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
              placeholder="Rechercher un membre…"
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
          <div className="flex gap-1" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius)', padding: 3, border: '1px solid var(--color-border)' }}>
            {(['all', 'owner', 'secretary', 'collaborator', 'intern'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '5px 10px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: roleFilter === r ? 'var(--color-card)' : 'transparent',
                  color: roleFilter === r ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  fontWeight: roleFilter === r ? 600 : 400,
                  boxShadow: roleFilter === r ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                {r === 'all' ? 'Tous' : ROLE_META[r].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflowX: 'auto', background: 'var(--color-card)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1.2fr 1fr 80px 80px',
              minWidth: 640,
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-secondary)',
            }}
          >
            {['Membre', 'Rôle', 'Dossiers', 'Statut', ''].map((h) => (
              <span key={h} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </span>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>
              Aucun membre trouvé
            </div>
          )}
          {filtered.map((m, i) => (
            <div
              key={m.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 1.2fr 1fr 80px 80px',
                minWidth: 640,
                padding: '12px 16px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63,0.02)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              onClick={() => router.push(`/members/${m.id}`)}
            >
              <div className="flex items-center gap-3">
                <Avatar initials={m.avatar} size={34} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>
                    {m.firstName} {m.lastName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{m.email}</div>
                </div>
              </div>
              <RoleBadge role={m.role} />
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                {cases.filter((c) => c.assignedTo === m.id).length} dossier{cases.filter((c) => c.assignedTo === m.id).length !== 1 ? 's' : ''}
              </span>
              <StatusDot status={m.status} />
              {hasPermission('manageUsers') && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    const { error } = await toggleMemberStatus(m.id)
                    if (error) showToast(error)
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-border)',
                    borderRadius: 3,
                    padding: '3px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-muted-foreground)',
                  }}
                >
                  {m.status === 'active' ? 'Désactiver' : 'Activer'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
