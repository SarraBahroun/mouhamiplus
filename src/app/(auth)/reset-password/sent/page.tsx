'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'

export default function ResetSentPage() {
  const router = useRouter()
  const { tr } = useLang()
  return (
    <Card style={{ maxWidth: 400 }}>
      <div className="flex flex-col gap-6 items-center text-center">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(22, 35, 63,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="var(--color-primary)">
            <path d="M4 6h20a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" opacity="0.2" />
            <path d="M3 7l11 8 11-8" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
            {tr.reset_sent_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {tr.reset_sent_sub} <strong style={{ color: 'var(--color-foreground)' }}>a.trabelsi@barreau-tunis.tn</strong>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Btn fullWidth onClick={() => router.push('/reset-password/new')}>Ouvrir le lien de réinitialisation</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/login')}>Retour à la connexion</Btn>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>
          Vérifiez aussi votre dossier spam. Le lien expire dans{' '}
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>30 min</span>.
        </p>
      </div>
    </Card>
  )
}
