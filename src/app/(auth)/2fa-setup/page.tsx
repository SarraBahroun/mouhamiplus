'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { OtpInput } from '@/components/ui/OtpInput'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

export default function TwoFASetupPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [code, setCode] = useState('')
  const [qrSvg, setQrSvg] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      // Un facteur non vérifié peut rester d'un essai précédent — on repart propre.
      // (listFactors().data.totp ne contient que les facteurs déjà vérifiés, il faut filtrer .all)
      const { data: existing } = await supabase.auth.mfa.listFactors()
      const staleTotp = existing?.all?.filter((f) => f.factor_type === 'totp') ?? []
      for (const f of staleTotp) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (enrollError || !data) {
        setError("Impossible de générer le code QR. Réessayez plus tard.")
        return
      }
      setFactorId(data.id)
      setQrSvg(data.totp.qr_code)
      setSecret(data.totp.secret)
    })()
  }, [])

  const enable = async () => {
    if (!factorId) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError || !challenge) {
      setLoading(false)
      setError('Une erreur est survenue. Réessayez.')
      return
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code })
    setLoading(false)
    if (verifyError) {
      setError('Code invalide. Réessayez.')
      setCode('')
      return
    }
    router.push('/dashboard')
  }

  const skip = async () => {
    if (factorId) {
      const supabase = createClient()
      await supabase.auth.mfa.unenroll({ factorId })
    }
    router.push('/dashboard')
  }

  return (
    <Card style={{ maxWidth: 440 }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
            {tr.setup_2fa_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {tr.setup_2fa_sub}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', margin: 0 }}>{tr.scan_qr}</p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 16,
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: 4,
              minHeight: 176,
              alignItems: 'center',
            }}
          >
            {qrSvg ? (
              // eslint-disable-next-line @next/next/no-img-element -- data: URI SVG from Supabase, not a static asset
              <img src={qrSvg} alt="Code QR d'authentification à deux facteurs" width={160} height={160} />
            ) : (
              <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>Génération du code…</span>
            )}
          </div>
          {secret && (
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--color-secondary)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                Clé manuelle :
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', color: 'var(--color-foreground)', wordBreak: 'break-all' }}>
                {secret}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', margin: 0 }}>{tr.enter_code}</p>
          <OtpInput value={code} onChange={setCode} />
        </div>

        {error && (
          <p style={{ fontSize: 12, color: 'var(--color-error)', textAlign: 'center', margin: 0 }}>{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <Btn fullWidth disabled={code.length < 6 || loading || !factorId} onClick={enable}>
            {loading ? '…' : tr.enable_2fa}
          </Btn>
          <Btn fullWidth variant="secondary" onClick={skip}>
            {tr.skip_2fa}
          </Btn>
        </div>
      </div>
    </Card>
  )
}
