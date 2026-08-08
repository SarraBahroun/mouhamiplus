'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { createClient } from '@/lib/supabase/client'

function VerifyEmailScreen() {
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)

  const resend = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    setResent(false)
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/register/plan')}` },
    })
    setLoading(false)
    if (resendError) {
      setError("Impossible de renvoyer l'email pour l'instant. Réessayez dans quelques instants.")
      return
    }
    setResent(true)
  }

  return (
    <Card style={{ maxWidth: 460 }}>
      <div className="flex flex-col gap-5" style={{ textAlign: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          ✉️
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 6px' }}>
            Vérifiez votre email
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Un email de confirmation a été envoyé à <strong>{email || 'votre adresse email'}</strong>.
            Ouvrez-le et cliquez sur le lien pour activer votre compte.
          </p>
        </div>

        {error && (
          <p style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}>{error}</p>
        )}
        {resent && !error && (
          <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: 0 }}>Un nouvel email a été envoyé.</p>
        )}

        <div className="flex flex-col gap-2" style={{ width: '100%' }}>
          <Btn fullWidth variant="ghost" disabled={!email || loading} onClick={resend}>
            {loading ? '…' : "Renvoyer l'email"}
          </Btn>
        </div>
      </div>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailScreen />
    </Suspense>
  )
}
