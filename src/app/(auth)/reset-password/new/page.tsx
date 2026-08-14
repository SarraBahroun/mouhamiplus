'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

export default function ResetNewPassPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [sessionValid, setSessionValid] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setSessionValid(!!data.session)
      setCheckingSession(false)
    })
  }, [])

  const strength = pass.length === 0 ? 0 : pass.length < 8 ? 1 : pass.length < 12 ? 2 : 3
  const strengthColors = ['transparent', '#C0392B', '#E67E22', '#27AE60']
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort']

  const submit = async () => {
    if (!pass || pass !== confirm) return
    if (pass.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password: pass })
    if (updateError) {
      setLoading(false)
      setError('Impossible de mettre à jour le mot de passe. Réessayez ou redemandez un lien.')
      return
    }
    await supabase.auth.signOut()
    setLoading(false)
    router.push('/login')
  }

  if (checkingSession) {
    return (
      <Card style={{ maxWidth: 400 }}>
        <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', textAlign: 'center' }}>Vérification du lien…</p>
      </Card>
    )
  }

  if (!sessionValid) {
    return (
      <Card style={{ maxWidth: 400 }}>
        <div className="flex flex-col gap-4 text-center">
          <p style={{ fontSize: 13, color: 'var(--color-error)' }}>
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Btn fullWidth onClick={() => router.push('/reset-password')}>Redemander un lien</Btn>
        </div>
      </Card>
    )
  }

  return (
    <Card style={{ maxWidth: 400 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
            {tr.new_pass_title}
          </h1>
        </div>
        <div className="flex flex-col gap-3">
          <Input label={tr.new_pass} type="password" value={pass} onChange={setPass} />
          {pass && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background: strength >= level ? strengthColors[strength] : 'var(--color-border)',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 11, color: strengthColors[strength], fontFamily: 'var(--font-mono)' }}>
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>
        <Input
          label={tr.confirm_pass}
          type="password"
          value={confirm}
          onChange={setConfirm}
          error={error || (confirm && confirm !== pass ? 'Les mots de passe ne correspondent pas' : '')}
        />
        <Btn fullWidth disabled={!pass || pass !== confirm || loading} onClick={submit}>
          {loading ? '…' : tr.save_pass}
        </Btn>
      </div>
    </Card>
  )
}
