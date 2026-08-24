'use client'

import { use, useState } from 'react'
import { useRouter, notFound } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Toggle } from '@/components/ui/Toggle'
import { ROLE_META } from '@/lib/members-data'
import { PERMISSION_DEFS, ROLE_DEFAULT_PERMISSIONS, PermissionSet } from '@/lib/permissions'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'

export default function MemberPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()
  const { members, memberPermissionOverrides, setMemberPermissionOverride, loading } = useAppData()
  const member = members.find((m) => m.id === id)
  const existingOverride = member ? memberPermissionOverrides[member.id] : undefined

  const [useDefault, setUseDefault] = useState(!existingOverride)
  const [perms, setPerms] = useState<PermissionSet>(
    () => ({ ...(existingOverride ?? ROLE_DEFAULT_PERMISSIONS[member?.role ?? 'intern']) })
  )

  if (loading) return null
  if (!member) notFound()

  const toggle = (key: keyof PermissionSet) => {
    if (useDefault) return
    setPerms((p) => ({ ...p, [key]: !p[key] }))
  }

  const save = async () => {
    const { error } = await setMemberPermissionOverride(member.id, useDefault ? null : perms)
    if (error) {
      showToast("Impossible d'enregistrer les permissions — vérifiez que vous avez le droit de gérer les membres")
      return
    }
    showToast('Permissions enregistrées')
    router.push(`/members/${member.id}`)
  }

  const activeSet = useDefault ? ROLE_DEFAULT_PERMISSIONS[member.role] : perms

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>
            Permissions personnalisées
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {member.firstName} {member.lastName} · {ROLE_META[member.role].label}
          </p>
        </div>

        {/* Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            background: 'var(--color-card)',
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Utiliser les permissions par défaut du rôle</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 2 }}>
              {useDefault ? `Permissions héritées du rôle ${ROLE_META[member.role].label}` : 'Permissions personnalisées — modifications manuelles activées'}
            </div>
          </div>
          <Toggle checked={useDefault} onChange={() => setUseDefault(!useDefault)} />
        </div>

        {/* Permissions list */}
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-card)' }}>
          {PERMISSION_DEFS.map((def, i) => (
            <div
              key={def.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '13px 16px',
                borderBottom: i < PERMISSION_DEFS.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{def.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 2 }}>{def.desc}</div>
              </div>
              <Toggle checked={activeSet[def.key]} onChange={() => toggle(def.key)} disabled={useDefault} />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Btn fullWidth onClick={save}>Enregistrer les permissions</Btn>
          <Btn variant="secondary" onClick={() => router.push('/members')}>Annuler</Btn>
        </div>
      </div>
    </div>
  )
}
