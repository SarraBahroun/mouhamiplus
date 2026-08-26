'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import { Divider } from '@/components/ui/Divider'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/providers/LangProvider'

export default function ClientLoginPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !pass) {
      setError(tr.client_login_required_field)
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (signInError || !data.user) {
      setLoading(false)
      setError(tr.client_login_wrong_credentials)
      return
    }
    const { data: clientRow } = await supabase.from('clients').select('id').eq('auth_user_id', data.user.id).single()
    setLoading(false)
    if (!clientRow) {
      setError(tr.client_login_no_client_space)
      await supabase.auth.signOut()
      return
    }
    router.push('/espace-client/dashboard')
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
            {tr.client_login_tagline}
          </p>
        </div>

        <Divider />

        <div className="flex flex-col gap-4">
          <Input
            label={tr.client_login_identifier_label}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="vous@email.tn"
            error={!email && error ? error : ''}
            hint={tr.client_login_identifier_hint}
          />
          <Input label={tr.password} type="password" value={pass} onChange={setPass} error={error && (!pass || (email && pass)) ? error : ''} />
        </div>

        <div className="flex flex-col gap-3">
          <Btn type="submit" fullWidth disabled={loading}>{loading ? '…' : tr.client_login_submit_btn}</Btn>
          <div className="flex items-center justify-center gap-1.5">
            <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{tr.forgot}</span>
            <button
              type="button"
              onClick={() => router.push('/reset-password')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
            >
              {tr.client_login_reset_btn}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-primary)" style={{ flexShrink: 0 }}>
            <path d="M8 1a5 5 0 00-5 5v1H2a1 1 0 00-1 1v6a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1h-1V6a5 5 0 00-5-5zm3 6H5V6a3 3 0 016 0v1z" />
          </svg>
          <span style={{ fontSize: 12, color: 'var(--color-secondary-foreground)', fontFamily: 'var(--font-body)' }}>
            {tr.client_login_secure_note}
          </span>
        </div>
      </form>
    </Card>
  )
}
