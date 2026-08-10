'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'

export default function RegisterPendingPage() {
  const router = useRouter()

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
            Paiement en cours de vérification
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Votre justificatif de virement a bien été reçu. Notre équipe le vérifie et activera votre compte
            sous peu — reconnectez-vous dans quelques instants pour accéder à votre espace.
          </p>
        </div>

        <div className="flex flex-col gap-2" style={{ width: '100%' }}>
          <Btn fullWidth onClick={() => router.push('/2fa-setup')}>Configurer la double authentification</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/login')}>Retour à la connexion</Btn>
        </div>
      </div>
    </Card>
  )
}
