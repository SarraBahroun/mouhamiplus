import { Card } from '@/components/ui/Card'

const COPY: Record<string, { title: string; body: string }> = {
  pending_payment: {
    title: 'Choisissez votre forfait',
    body: "Votre compte a été créé mais aucun paiement n'a encore été envoyé. Rendez-vous sur la page d'inscription pour choisir un forfait et envoyer votre justificatif de virement.",
  },
  pending_review: {
    title: 'Paiement en cours de vérification',
    body: "Votre justificatif de virement est en cours de vérification par notre équipe. Votre compte sera activé sous peu — reconnectez-vous dans quelques instants pour accéder à votre espace.",
  },
  rejected: {
    title: 'Justificatif refusé',
    body: "Votre justificatif de virement n'a pas pu être validé. Merci de contacter le support ou d'envoyer un nouveau justificatif depuis la page de paiement.",
  },
}

export function SubscriptionGate({ status, plan }: { status: string; plan: string | null }) {
  const copy = COPY[status] ?? COPY.pending_review
  const paymentHref = plan ? `/register/payment?plan=${plan}` : '/register/plan'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--color-background)' }}>
      <Card style={{ maxWidth: 460 }}>
        <div className="flex flex-col gap-3">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>{copy.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{copy.body}</p>
          {status === 'pending_payment' && (
            <a href="/register/plan" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>
              Choisir un forfait →
            </a>
          )}
          {status === 'rejected' && (
            <a href={paymentHref} style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>
              Envoyer un nouveau justificatif →
            </a>
          )}
        </div>
      </Card>
    </div>
  )
}
