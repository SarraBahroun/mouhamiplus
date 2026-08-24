'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { PLANS } from '@/lib/billing'
import { selectPlan } from './actions'

export default function RegisterPlanPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    if (!selected) return
    setError('')
    setLoading(true)
    const result = await selectPlan(selected)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push(`/register/payment?plan=${selected}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 6px' }}>
          Choisissez votre forfait
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
          Vous pourrez changer de forfait à tout moment en nous contactant.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.id
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                padding: '22px 20px',
                borderRadius: 'var(--radius)',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: 'var(--color-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                transition: 'border-color 0.12s',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{plan.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-muted-foreground)' }}>{plan.tagline}</p>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{plan.priceLabel}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 12, color: 'var(--color-foreground)', display: 'flex', gap: 6 }}>
                    <span style={{ color: 'var(--color-primary)' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      {error && (
        <p style={{ fontSize: 13, color: 'var(--color-error)', textAlign: 'center', margin: 0 }}>{error}</p>
      )}

      <Btn fullWidth disabled={!selected || loading} onClick={confirm}>
        {loading ? '…' : 'Continuer'}
      </Btn>
    </div>
  )
}
