'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Avatar } from '@/components/members/Avatar'
import { RoleBadge } from '@/components/members/RoleBadge'
import { StatusDot } from '@/components/members/StatusDot'
import { ROLE_META, ACTION_COLORS } from '@/lib/members-data'
import { PERMISSION_DEFS, ROLE_DEFAULT_PERMISSIONS } from '@/lib/permissions'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'
import { useSession } from '@/providers/SessionProvider'
import { useLang } from '@/providers/LangProvider'
import { resetMemberPassword } from '../actions'

const ACTION_ICONS: Record<string, string> = {
  AJOUT: '📎',
  MODIFICATION: '✏️',
  SUPPRESSION: '🗑️',
  EXPORT: '📤',
  LECTURE: '👁️',
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()
  const { lang } = useLang()
  const { hasPermission } = useSession()
  const { members, cases, auditLog, toggleMemberStatus, memberPermissionOverrides, loading } = useAppData()
  const member = members.find((m) => m.id === id)
  const assignedCases = cases.filter((c) => c.assignedTo === id)
  const memberActivity = auditLog.filter((e) => e.actorId === id).slice(0, 15)
  const supervisor = member?.supervisorId ? members.find((m) => m.id === member.supervisorId) : null
  const [tab, setTab] = useState<'info' | 'cases' | 'activity' | 'permissions'>('info')
  const [resetting, setResetting] = useState(false)
  const [revealedAccess, setRevealedAccess] = useState<{ tempPassword: string; emailed?: boolean } | null>(null)

  useEffect(() => {
    const key = `mouhamiplus-member-access-${id}`
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
  if (!member) notFound()

  const resetPassword = async () => {
    setResetting(true)
    const result = await resetMemberPassword(member.id)
    setResetting(false)
    if ('error' in result) {
      showToast(result.error)
      return
    }
    setRevealedAccess({ tempPassword: result.tempPassword, emailed: result.emailed })
  }

  const effectivePermissions = memberPermissionOverrides[member.id] ?? ROLE_DEFAULT_PERMISSIONS[member.role]
  const isCustomized = Boolean(memberPermissionOverrides[member.id])

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'info', label: 'Infos' },
    { id: 'cases', label: 'Dossiers assignés' },
    { id: 'activity', label: "Historique d'activité" },
    { id: 'permissions', label: 'Permissions' },
  ]

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      <div className="flex flex-col gap-5">
        {/* Profile header */}
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
          <Avatar initials={member.avatar} size={56} />
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>
                {member.firstName} {member.lastName}
              </h2>
              <RoleBadge role={member.role} size="md" />
              {member.role === 'intern' && (
                <span style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(230,81,0,0.1)', color: '#E65100', borderRadius: 3, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  SUPERVISION REQUISE
                </span>
              )}
            </div>
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{member.email}</span>
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{member.phone}</span>
              {supervisor && (
                <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>
                  Superviseur : <strong style={{ color: 'var(--color-foreground)' }}>{supervisor.firstName} {supervisor.lastName}</strong>
                </span>
              )}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>
                Membre depuis le {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>
                Actif {new Date(member.lastActive).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
          <StatusDot status={member.status} />
        </div>

        {/* Identifiants générés — toujours affichés ici, même si un email a aussi été envoyé */}
        {revealedAccess && (
          <div style={{ padding: '14px 16px', border: '1px solid var(--color-primary)', borderRadius: 6, background: 'rgba(22, 35, 63,0.04)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)' }}>
              {revealedAccess.emailed ? 'Mot de passe réinitialisé — également envoyé par email' : 'Mot de passe généré — à transmettre au membre'}
              {' '}(ne sera plus affiché après fermeture)
            </p>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>Mot de passe : <strong>{revealedAccess.tempPassword}</strong></div>
            <div>
              <Btn variant="secondary" onClick={() => setRevealedAccess(null)}>J&apos;ai noté l&apos;information</Btn>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Btn variant="secondary" onClick={() => router.push(`/members/${member.id}/edit`)}>✏️ Modifier</Btn>
          {hasPermission('manageUsers') && (
            <Btn
              variant="secondary"
              onClick={async () => {
                const { error } = await toggleMemberStatus(member.id)
                if (error) showToast(error)
              }}
            >
              {member.status === 'active' ? '🔒 Désactiver le compte' : '🔓 Réactiver le compte'}
            </Btn>
          )}
          <Btn variant="secondary" onClick={resetPassword} disabled={resetting}>
            {resetting ? '…' : '🔑 Réinitialiser le mot de passe'}
          </Btn>
          <Btn variant="secondary" onClick={() => router.push(`/members/${member.id}/permissions`)}>🛡️ Permissions</Btn>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 0 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '9px 16px',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                fontWeight: tab === t.id ? 600 : 400,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
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
                { label: 'Rôle', value: ROLE_META[member.role].label[lang] },
                { label: 'Email', value: member.email },
                { label: 'Téléphone', value: member.phone },
                { label: 'Date de création', value: new Date(member.joinedAt).toLocaleDateString('fr-FR') },
                { label: 'Dernière connexion', value: new Date(member.lastActive).toLocaleDateString('fr-FR') },
                ...(supervisor ? [{ label: 'Superviseur', value: `${supervisor.firstName} ${supervisor.lastName}` }] : []),
                ...(member.specialities.length ? [{ label: 'Spécialités', value: member.specialities.join(', ') }] : []),
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
                {assignedCases.length} dossier{assignedCases.length !== 1 ? 's' : ''} assigné{assignedCases.length !== 1 ? 's' : ''}
              </h3>
              {assignedCases.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucun dossier assigné.</p>
              ) : (
                assignedCases.map((c) => (
                  <div key={c.id} onClick={() => router.push(`/cases/${c.id}`)} style={{ padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--color-primary)" opacity="0.6">
                      <path d="M2 2h10a1 1 0 011 1v9a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1zM4 6h6M4 8h4" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    </svg>
                    {c.title}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="flex flex-col gap-2">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Activité récente</h3>
              {memberActivity.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucune activité enregistrée.</p>
              ) : (
                memberActivity.map((a, i) => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '9px 0', borderBottom: i < memberActivity.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <span style={{ fontSize: 16 }}>{ACTION_ICONS[a.action] ?? '•'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--color-foreground)' }}>
                        {ACTION_COLORS[a.action] ? a.action.charAt(0) + a.action.slice(1).toLowerCase() : a.action} — {a.entity}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', marginTop: 2 }}>
                        {new Date(a.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'permissions' && (
            <div className="flex flex-col gap-3">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Permissions actives</h3>
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
                {isCustomized ? 'Permissions personnalisées.' : `Permissions héritées du rôle ${ROLE_META[member.role].label[lang]}.`}{' '}
                <button onClick={() => router.push(`/members/${member.id}/permissions`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 13, fontWeight: 500 }}>
                  Personnaliser →
                </button>
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {PERMISSION_DEFS.map((def) => (
                  <span
                    key={def.key}
                    style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      background: effectivePermissions[def.key] ? 'rgba(39,174,96,0.08)' : 'rgba(189,195,199,0.2)',
                      color: effectivePermissions[def.key] ? '#2E7D32' : 'var(--color-muted-foreground)',
                      borderRadius: 3,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {effectivePermissions[def.key] ? '✓' : '✗'} {def.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <Btn fullWidth variant="ghost" onClick={() => router.push('/members')}>← Retour à la liste</Btn>
      </div>
    </div>
  )
}
