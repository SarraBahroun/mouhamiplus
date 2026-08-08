'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { useSession } from '@/providers/SessionProvider'
import { createClient } from '@/lib/supabase/client'

export default function SessionsPage() {
  const { tr } = useLang()
  const router = useRouter()
  const { realProfile, signOut } = useSession()
  const [lastSignIn, setLastSignIn] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setLastSignIn(data.user?.last_sign_in_at ?? null)
    })
  }, [])

  const disconnect = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
            {tr.sessions_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.sessions_sub}</p>
        </div>

        <div className="flex flex-col gap-2">
          <div
            style={{
              background: 'rgba(22, 35, 63,0.03)',
              border: '1px solid rgba(22, 35, 63,0.2)',
              borderRadius: 6,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                background: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🖥️
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{realProfile?.email ?? '—'}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-foreground)',
                    borderRadius: 2,
                    fontWeight: 500,
                  }}
                >
                  {tr.current_session.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 2 }}>
                {lastSignIn ? new Date(lastSignIn).toLocaleString('fr-FR') : '—'}
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: 0 }}>
          Supabase ne permet pas encore de lister les autres appareils connectés depuis le navigateur — seule votre session actuelle est affichée ici.
        </p>

        <Btn fullWidth variant="secondary" onClick={disconnect}>
          {tr.revoke}
        </Btn>
      </div>
    </div>
  )
}
