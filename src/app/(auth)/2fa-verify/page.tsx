'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { OtpInput } from '@/components/ui/OtpInput'
import { useLang } from '@/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

export default function TwoFAVerifyPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [code, setCode] = useState('')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data, error: listError } = await supabase.auth.mfa.listFactors()
      const totp = data?.totp?.[0]
      if (listError || !totp) {
        router.replace('/dashboard')
        return
      }
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totp.id })
      if (challengeError || !challenge) {
        setError("Impossible de générer le code de vérification. Réessayez.")
        return
      }
      setFactorId(totp.id)
      setChallengeId(challenge.id)
      setReady(true)
    })()
  }, [router])

  const verify = async () => {
    if (!factorId || !challengeId) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
    setLoading(false)
    if (verifyError) {
      setError('Code invalide. Réessayez.')
      setCode('')
      return
    }
    router.push('/dashboard')
  }

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div
            style={{
              width: 48,
              height: 48,
              background: 'rgba(22, 35, 63,0.08)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="var(--color-primary)">
              <path d="M11 2a5 5 0 00-5 5v1H5a1 1 0 00-1 1v9a1 1 0 001 1h12a1 1 0 001-1V9a1 1 0 00-1-1h-1V7a5 5 0 00-5-5zm3 6H8V7a3 3 0 016 0v1zm-3 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, textAlign: 'center', margin: 0 }}>
            {tr.verify_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', textAlign: 'center', margin: 0 }}>
            {tr.verify_sub}
          </p>
        </div>

        <OtpInput value={code} onChange={setCode} />

        {error && (
          <p style={{ fontSize: 12, color: 'var(--color-error)', textAlign: 'center', margin: 0 }}>{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <Btn onClick={verify} fullWidth disabled={!ready || loading || code.length < 6}>
            {loading ? '…' : tr.verify_btn}
          </Btn>
        </div>

        <div
          style={{
            padding: '10px 12px',
            background: 'rgba(22, 35, 63,0.04)',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(22, 35, 63,0.12)',
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted-foreground)' }}>
            Le code se renouvelle automatiquement toutes les 30 secondes dans votre application d&apos;authentification.
          </p>
        </div>
      </div>
    </Card>
  )
}
