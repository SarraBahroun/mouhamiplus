'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { InviteList, InviteRow } from '@/components/onboarding/InviteList'

const ROLE_OPTIONS = [
  { value: 'collaborator', label: 'Avocat' },
  { value: 'secretary', label: 'Secrétaire' },
  { value: 'intern', label: 'Stagiaire' },
]

export default function RegisterCabinetInvitePage() {
  const router = useRouter()
  const [inviteNow, setInviteNow] = useState(true)
  const [rows, setRows] = useState<InviteRow[]>([
    { id: 1, name: '', email: '', role: 'collaborator' },
  ])

  return (
    <Card style={{ maxWidth: 520 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
            Invitation des membres
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Étape 3 sur 3 — Votre équipe</p>
        </div>

        <div className="flex gap-2" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius)', padding: 3, border: '1px solid var(--color-border)' }}>
          {[{ id: true, label: 'Inviter maintenant' }, { id: false, label: 'Plus tard' }].map((opt) => (
            <button
              key={String(opt.id)}
              onClick={() => setInviteNow(opt.id)}
              style={{
                flex: 1,
                padding: '8px 10px',
                fontSize: 13,
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
                background: inviteNow === opt.id ? 'var(--color-card)' : 'transparent',
                color: inviteNow === opt.id ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                fontWeight: inviteNow === opt.id ? 600 : 400,
                boxShadow: inviteNow === opt.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {inviteNow && (
          <InviteList rows={rows} setRows={setRows} roleOptions={ROLE_OPTIONS} />
        )}

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={() => router.push('/register/plan')}>Continuer</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register/cabinet/team')}>Retour</Btn>
        </div>
      </div>
    </Card>
  )
}
