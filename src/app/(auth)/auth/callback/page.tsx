'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { EmailOtpType } from '@supabase/supabase-js'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/providers/LangProvider'

function AuthCallbackScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const { tr } = useLang()
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
          setError(tr.callback_expired_reset)
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
          setError(tr.callback_expired_reset)
          return
        }
        router.replace(next)
        return
      }

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !data.session) {
        setError(tr.callback_invalid_confirm)
        return
      }
      router.replace(next)
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tr change à chaque bascule de langue ; l'effet ne doit ré-exécuter l'échange de session que si les paramètres d'URL changent, pas la langue
  }, [router, next, code, tokenHash, otpType, errorDescription])

  return (
    <Card style={{ maxWidth: 420 }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13, color: (linkError || error) ? 'var(--color-error)' : 'var(--color-muted-foreground)', margin: 0 }}>
          {linkError || error || tr.callback_in_progress}
        </p>
        {(linkError || error) && <Btn onClick={() => router.push('/reset-password')}>{tr.callback_retry_btn}</Btn>}
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
