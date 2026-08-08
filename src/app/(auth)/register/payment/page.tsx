'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { Btn } from '@/components/ui/Btn'
import { BANK_TRANSFER_INFO, planById } from '@/lib/billing'
import { submitPaymentReceipt } from './actions'

function RegisterPaymentForm() {
  const router = useRouter()
  const params = useSearchParams()
  const planId = params.get('plan') ?? ''
  const plan = planById(planId)

  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!file) {
      setError('Merci de joindre une photo du justificatif de virement.')
      return
    }
    setError('')
    setLoading(true)
    const formData = new FormData()
    formData.set('plan', planId)
    formData.set('file', file)
    const result = await submitPaymentReceipt(formData)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push('/register/pending')
  }

  if (!plan) {
    return (
      <Card style={{ maxWidth: 480 }}>
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Choisissez d&apos;abord un forfait.
          </p>
          <Btn fullWidth onClick={() => router.push('/register/plan')}>Choisir un forfait</Btn>
        </div>
      </Card>
    )
  }

  return (
    <Card style={{ maxWidth: 520 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
            Paiement par virement bancaire
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Forfait <strong>{plan.name}</strong> — {plan.priceLabel}
          </p>
        </div>

        <Divider text="COORDONNÉES BANCAIRES" />

        <div
          style={{
            padding: '14px 16px',
            background: 'var(--color-secondary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <Row label="Banque" value={BANK_TRANSFER_INFO.bankName} />
          <Row label="Titulaire" value={BANK_TRANSFER_INFO.accountHolder} />
          <Row label="RIB" value={BANK_TRANSFER_INFO.rib} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: 0 }}>
          Effectuez le virement du montant du forfait choisi, puis joignez une photo lisible du reçu de virement ci-dessous.
          Votre compte sera activé après vérification par notre équipe.
        </p>

        <Divider text="JUSTIFICATIF" />

        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '24px 16px',
            border: '1.5px dashed var(--color-border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span style={{ fontSize: 13, color: 'var(--color-foreground)', fontWeight: 500 }}>
            {file ? file.name : 'Choisir une photo ou un PDF du reçu'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>8 Mo maximum</span>
        </label>

        {error && (
          <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <Btn fullWidth disabled={!file || loading} onClick={submit}>
            {loading ? '…' : 'Envoyer le justificatif'}
          </Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register/plan')}>Retour</Btn>
        </div>
      </div>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{label}</span>
      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function RegisterPaymentPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPaymentForm />
    </Suspense>
  )
}
