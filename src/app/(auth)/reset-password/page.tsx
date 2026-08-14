'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

export default function ResetRequestPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email) return
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/new`,
    })
    setLoading(false)
    if (resetError) {
      setError("Impossible d'envoyer le lien. Vérifiez l'adresse et réessayez.")
      return
    }
    router.push(`/reset-password/sent?email=${encodeURIComponent(email)}`)
  }

  return (
    <Card style={{ maxWidth: 400 }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
            {tr.reset_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.reset_sub}</p>
        </div>
        <Input label={tr.email} type="email" value={email} onChange={setEmail} placeholder="nom@barreau.tn" error={error} />
        <div className="flex flex-col gap-2">
          <Btn fullWidth disabled={!email || loading} onClick={submit}>{loading ? '…' : tr.send_link}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/login')}>{tr.back}</Btn>
        </div>
      </div>
    </Card>
  )
}
