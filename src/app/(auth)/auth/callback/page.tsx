'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/register/plan'
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError || !data.session) {
        setError("Ce lien de confirmation est invalide ou a expiré. Merci de vous reconnecter.")
        return
      }
      router.replace(next)
    })
  }, [router, next])

  return (
    <Card style={{ maxWidth: 420 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: error ? 'var(--color-error)' : 'var(--color-muted-foreground)', margin: 0 }}>
          {error || 'Confirmation en cours…'}
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
