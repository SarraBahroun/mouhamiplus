'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { RoleBadge } from '@/components/members/RoleBadge'
import { MemberRole, ROLE_META } from '@/lib/members-data'
import { useSession } from '@/providers/SessionProvider'

type AssignableRole = MemberRole

const roleTargets: Record<AssignableRole, string> = {
  owner: '/members/add/associate',
  secretary: '/members/add/secretary',
  collaborator: '/members/add/collaborator',
  intern: '/members/add/intern',
}

const icons: Record<AssignableRole, React.ReactNode> = {
  owner: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
      <path d="M14 3l9 5v6c0 6-3.8 9.8-9 11-5.2-1.2-9-5-9-11V8l9-5z" opacity="0.18" />
      <path d="M14 3l9 5v6c0 6-3.8 9.8-9 11-5.2-1.2-9-5-9-11V8l9-5z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M10 14l3 3 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  secretary: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
      <rect x="4" y="6" width="20" height="16" rx="2" opacity="0.2" />
      <path d="M8 11h12M8 15h8" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="19" r="3" opacity="0.8" />
    </svg>
  ),
  collaborator: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
      <circle cx="10" cy="10" r="4" opacity="0.8" />
      <circle cx="18" cy="10" r="4" opacity="0.4" />
      <path d="M2 22c0-4.4 3.6-8 8-8s8 3.6 8 8" opacity="0.6" />
      <path d="M18 14c2.2 0 4 1.8 4 4v4" opacity="0.3" strokeWidth="1.5" stroke="currentColor" fill="none" />
    </svg>
  ),
  intern: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
      <circle cx="14" cy="9" r="4" opacity="0.8" />
      <path d="M6 22c0-4.4 3.6-8 8-8s8 3.6 8 8" opacity="0.5" />
      <path d="M14 4v3M10.5 6l1.5 2M17.5 6l-1.5 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M20 18l2-2 2 2-2 2z" opacity="0.7" />
    </svg>
  ),
}

const perms: Record<AssignableRole, { label: string; granted: boolean }[]> = {
  owner: [
    { label: 'Tous les dossiers', granted: true },
    { label: 'Finance & paiements', granted: true },
    { label: 'Gestion des membres', granted: true },
    { label: 'Paramètres du cabinet', granted: true },
    { label: 'Accès IA', granted: true },
    { label: 'Suppression', granted: true },
  ],
  secretary: [
    { label: 'Lecture dossiers', granted: true },
    { label: 'Gestion agenda', granted: true },
    { label: 'Correspondances', granted: true },
    { label: 'Modification dossiers', granted: false },
    { label: 'Accès finance', granted: false },
    { label: 'Accès IA', granted: false },
  ],
  collaborator: [
    { label: 'Lecture dossiers', granted: true },
    { label: 'Modification dossiers', granted: true },
    { label: 'Rédaction actes', granted: true },
    { label: 'Accès finance', granted: false },
    { label: 'Accès IA', granted: false },
    { label: 'Suppression', granted: false },
  ],
  intern: [
    { label: 'Lecture dossiers assignés', granted: true },
    { label: 'Commentaires', granted: true },
    { label: 'Modification dossiers', granted: false },
    { label: 'Accès finance', granted: false },
    { label: 'Accès IA', granted: false },
    { label: 'Export', granted: false },
  ],
}

export default function MembersAddRolePage() {
  const router = useRouter()
  const { realProfile } = useSession()
  const [selected, setSelected] = useState<AssignableRole | null>(null)
  // Seul un avocat associé peut en désigner un autre — le serveur applique la même règle.
  const assignableRoles: AssignableRole[] =
    realProfile?.role === 'owner' ? ['owner', 'secretary', 'collaborator', 'intern'] : ['secretary', 'collaborator', 'intern']

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
            Choisir le rôle
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Le rôle détermine les droits d&apos;accès par défaut du membre.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {assignableRoles.map((role) => {
            const m = ROLE_META[role]
            const isSelected = selected === role
            return (
              <button
                key={role}
                onClick={() => setSelected(role)}
                style={{
                  background: 'var(--color-card)',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 8,
                  padding: '16px 18px',
                  display: 'flex',
                  gap: 16,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s',
                  width: '100%',
                  boxShadow: isSelected ? '0 0 0 3px rgba(22, 35, 63,0.1)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 6,
                    background: isSelected ? m.bg : 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: m.color,
                    flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                >
                  {icons[role]}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{m.label}</span>
                    <RoleBadge role={role} />
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--color-muted-foreground)' }}>{m.desc}</p>
                  {isSelected && (
                    <div className="flex flex-wrap gap-1.5">
                      {perms[role].map((p) => (
                        <span
                          key={p.label}
                          style={{
                            fontSize: 11,
                            padding: '2px 7px',
                            borderRadius: 3,
                            fontFamily: 'var(--font-mono)',
                            background: p.granted ? 'rgba(39,174,96,0.1)' : 'rgba(189,195,199,0.25)',
                            color: p.granted ? '#27AE60' : 'var(--color-muted-foreground)',
                          }}
                        >
                          {p.granted ? '✓' : '✗'} {p.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }}>
                    <circle cx="9" cy="9" r="9" opacity="0.12" />
                    <path d="M5 9l3 3 5-5" stroke="var(--color-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          <Btn fullWidth disabled={!selected} onClick={() => selected && router.push(roleTargets[selected])}>
            Continuer
          </Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/members')}>Annuler</Btn>
        </div>
      </div>
    </div>
  )
}
