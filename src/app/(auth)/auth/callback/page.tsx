'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/register/plan'
  const code = params.get('code')
  const errorDescription = params.get('error_description')
  const linkError = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : ''
  const [error, setError] = useState('')

  useEffect(() => {
    if (errorDescription) return

    const supabase = createClient()

    const run = async () => {
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
  }, [router, next, code, errorDescription])

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
