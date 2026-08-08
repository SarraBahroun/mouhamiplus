'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'

export default function ResetRequestPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [email, setEmail] = useState('')
  return (
    <Card style={{ maxWidth: 400 }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
            {tr.reset_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.reset_sub}</p>
        </div>
        <Input label={tr.email} type="email" value={email} onChange={setEmail} placeholder="nom@barreau.tn" />
        <div className="flex flex-col gap-2">
          <Btn fullWidth disabled={!email} onClick={() => router.push('/reset-password/sent')}>{tr.send_link}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/login')}>{tr.back}</Btn>
        </div>
      </div>
    </Card>
  )
}
