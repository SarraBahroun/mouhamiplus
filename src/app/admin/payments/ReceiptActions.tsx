'use client'

import { useState } from 'react'
import { useLang } from '@/providers/LangProvider'
import { reviewPaymentReceipt } from './actions'

export function ReceiptActions({ receiptId, currentStatus }: { receiptId: string; currentStatus: 'pending' | 'approved' | 'rejected' }) {
  const { tr } = useLang()
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

  const status = done ?? currentStatus

  if (status !== 'pending') {
    return (
      <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
        <p style={{ fontSize: 12, color: status === 'approved' ? 'var(--color-primary)' : 'var(--color-error)', margin: 0 }}>
          {status === 'approved' ? tr.admin_payments_active_note : tr.admin_payments_rejected_note}
        </p>
        <button
          onClick={() => decide(status === 'approved' ? 'rejected' : 'approved')}
          disabled={loading !== null}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-foreground)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '…' : status === 'approved' ? tr.admin_payments_revoke : tr.admin_payments_reactivate}
        </button>
        {error && <span style={{ fontSize: 11, color: 'var(--color-error)' }}>{error}</span>}
      </div>
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
        {loading === 'approved' ? '…' : tr.admin_payments_approve}
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
        {loading === 'rejected' ? '…' : tr.admin_payments_reject}
      </button>
      {error && <span style={{ fontSize: 11, color: 'var(--color-error)' }}>{error}</span>}
    </div>
  )
}
