'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import { Divider } from '@/components/ui/Divider'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !pass) {
      setError('Champ requis')
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (signInError || !signInData.user) {
      setLoading(false)
      setError('Email ou mot de passe incorrect.')
      return
    }
    const { data: profileRow } = await supabase.from('profiles').select('id').eq('id', signInData.user.id).maybeSingle()
    if (!profileRow) {
      setLoading(false)
      setError("Ce compte n'a pas d'accès cabinet. Utilisez l'espace client si vous êtes client.")
      await supabase.auth.signOut()
      return
    }
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    setLoading(false)
    if (aal && aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      router.push('/2fa-verify')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
            {tr.tagline}
          </p>
        </div>

        <Divider />

        <div className="flex flex-col gap-4">
          <Input label={tr.email} type="email" value={email} onChange={setEmail} placeholder="nom@barreau.tn" error={!email && error ? error : ''} />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)' }}>{tr.password}</label>
              <button
                type="button"
                onClick={() => router.push('/reset-password')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {tr.forgot}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Input label="" type={showPass ? 'text' : 'password'} value={pass} onChange={setPass} error={error && (!pass || (email && pass)) ? error : ''} />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-muted-foreground)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Btn type="submit" fullWidth disabled={loading}>{loading ? '…' : tr.login}</Btn>
          <div className="flex items-center justify-center gap-1.5">
            <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{tr.no_account}</span>
            <button
              type="button"
              onClick={() => router.push('/register')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {tr.register}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-primary)" style={{ flexShrink: 0 }}>
            <path d="M8 1a5 5 0 00-5 5v1H2a1 1 0 00-1 1v6a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1h-1V6a5 5 0 00-5-5zm3 6H5V6a3 3 0 016 0v1z" />
          </svg>
          <span style={{ fontSize: 12, color: 'var(--color-secondary-foreground)', fontFamily: 'var(--font-body)' }}>
            Connexion sécurisée — données chiffrées SSL/TLS
          </span>
        </div>
      </form>
    </Card>
  )
}
