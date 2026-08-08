'use client'

import { useState } from 'react'
import { reviewPaymentReceipt } from './actions'

export function ReceiptActions({ receiptId }: { receiptId: string }) {
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  const decide = async (decision: 'approved' | 'rejected') => {
    setLoading(decision)
    setError('')
    const result = await reviewPaymentReceipt(receiptId, decision)
    setLoading(null)
    if (result.error) {
      setError(result.error)
      return
    }
    setDone(decision)
  }

  if (done) {
    return (
      <p style={{ fontSize: 12, color: done === 'approved' ? 'var(--color-primary)' : 'var(--color-error)', margin: '4px 0 0' }}>
        {done === 'approved' ? 'Approuvé — le cabinet est maintenant actif.' : 'Rejeté.'}
      </p>
    )
  }

  return (
    <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
      <button
        onClick={() => decide('approved')}
        disabled={loading !== null}
        style={{
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 12px',
          borderRadius: 4,
          border: 'none',
          background: 'var(--color-primary)',
          color: 'var(--color-primary-foreground)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading === 'approved' ? '…' : 'Approuver'}
      </button>
      <button
        onClick={() => decide('rejected')}
        disabled={loading !== null}
        style={{
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid var(--color-border)',
          background: 'transparent',
          color: 'var(--color-foreground)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading === 'rejected' ? '…' : 'Rejeter'}
      </button>
      {error && <span style={{ fontSize: 11, color: 'var(--color-error)' }}>{error}</span>}
    </div>
  )
}
