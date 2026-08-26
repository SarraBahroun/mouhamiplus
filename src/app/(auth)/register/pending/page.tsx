'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'

export default function RegisterPendingPage() {
  const router = useRouter()
  const { tr } = useLang()

  return (
    <Card style={{ maxWidth: 460 }}>
      <div className="flex flex-col gap-5" style={{ textAlign: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          ⏳
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 6px' }}>
            {tr.pending_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {tr.pending_body}
          </p>
        </div>

        <div className="flex flex-col gap-2" style={{ width: '100%' }}>
          <Btn fullWidth onClick={() => router.push('/2fa-setup')}>{tr.pending_setup_2fa_btn}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/login')}>{tr.pending_back_login_btn}</Btn>
        </div>
      </div>
    </Card>
  )
}
