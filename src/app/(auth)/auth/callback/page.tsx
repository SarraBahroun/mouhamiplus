'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { EmailOtpType } from '@supabase/supabase-js'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/register/plan'
  const code = params.get('code')
  const tokenHash = params.get('token_hash')
  const otpType = params.get('type') as EmailOtpType | null
  const errorDescription = params.get('error_description')
  const linkError = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : ''
  const [error, setError] = useState('')

  useEffect(() => {
    if (errorDescription) return

    const supabase = createClient()

    const run = async () => {
      // token_hash links (used for password recovery) verify against Supabase's server-side
      // record, not a locally-stored PKCE code_verifier — so they work even when opened on a
      // different device/browser than the one that requested the email. Unlike the ?code=
      // PKCE flow below, which requires the same browser session throughout.
      if (tokenHash && otpType) {
        const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType })
        if (verifyError) {
          setError("Ce lien de confirmation est invalide ou a expiré. Merci de renvoyer l'email depuis la page d'inscription.")
          return
        }
        router.replace(next)
        return
      }

      // Supabase's PKCE flow redirects here with ?code=... instead of tokens in the
      // URL hash — it must be exchanged explicitly before a session exists.
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError("Ce lien de confirmation est invalide ou a expiré. Merci de renvoyer l'email depuis la page d'inscription.")
          return
        }
        router.replace(next)
        return
      }

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !data.session) {
        setError("Ce lien de confirmation est invalide ou a expiré. Merci de renvoyer l'email depuis la page d'inscription.")
        return
      }
      router.replace(next)
    }

    run()
  }, [router, next, code, tokenHash, otpType, errorDescription])

  return (
    <Card style={{ maxWidth: 420 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: (linkError || error) ? 'var(--color-error)' : 'var(--color-muted-foreground)', margin: 0 }}>
          {linkError || error || 'Confirmation en cours…'}
        </p>
      </div>
    </Card>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackScreen />
    </Suspense>
  )
}
