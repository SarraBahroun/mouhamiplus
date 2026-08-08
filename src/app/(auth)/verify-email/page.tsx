'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { OtpInput } from '@/components/ui/OtpInput'
import { Btn } from '@/components/ui/Btn'
import { createClient } from '@/lib/supabase/client'

function VerifyEmailForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  const next = params.get('next') || '/register/plan'

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  const verify = async () => {
    if (!email || code.length < 6) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
    setLoading(false)
    if (verifyError) {
      setError('Code invalide ou expiré. Réessayez.')
      setCode('')
      return
    }
    router.push(next)
  }

  const resend = async () => {
    if (!email) return
    setError('')
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email })
    if (resendError) {
      setError("Impossible de renvoyer le code pour l'instant. Réessayez dans quelques instants.")
      return
    }
    setResent(true)
  }

  return (
    <Card style={{ maxWidth: 440 }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
            Vérifiez votre email
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Un code à 6 chiffres a été envoyé à <strong>{email || 'votre adresse email'}</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', margin: 0 }}>Code de vérification</p>
          <OtpInput value={code} onChange={setCode} />
        </div>

        {error && (
          <p style={{ fontSize: 12, color: 'var(--color-error)', textAlign: 'center', margin: 0 }}>{error}</p>
        )}
        {resent && !error && (
          <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', textAlign: 'center', margin: 0 }}>Un nouveau code a été envoyé.</p>
        )}

        <div className="flex flex-col gap-2">
          <Btn fullWidth disabled={code.length < 6 || loading || !email} onClick={verify}>
            {loading ? '…' : 'Vérifier'}
          </Btn>
          <Btn fullWidth variant="ghost" onClick={resend}>
            Renvoyer le code
          </Btn>
        </div>
      </div>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}
