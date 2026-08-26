'use client'

import { useLang } from '@/providers/LangProvider'
import { ReceiptActions } from './ReceiptActions'

export interface AdminPaymentReceiptRow {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  amount: number | null
  createdAt: string
  cabinetName: string | null
  cabinetCity: string | null
  planName: string | null
  planPriceLabel: string | null
  planIdFallback: string
  url: string | null
}

export function AdminPaymentsView({ receipts }: { receipts: AdminPaymentReceiptRow[] }) {
  const { tr } = useLang()

  const STATUS_LABEL: Record<AdminPaymentReceiptRow['status'], { label: string; color: string; bg: string }> = {
    pending: { label: tr.common_pending, color: '#E65100', bg: 'rgba(230,81,0,0.1)' },
    approved: { label: tr.common_active, color: '#2E7D32', bg: 'rgba(46,125,50,0.1)' },
    rejected: { label: tr.admin_payments_status_rejected, color: '#C62828', bg: 'rgba(198,40,40,0.1)' },
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>
        {tr.admin_payments_title}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: '0 0 24px' }}>
        {tr.admin_payments_subtitle.replace('{count}', String(receipts.length))}
      </p>

      <div className="flex flex-col gap-3">
        {receipts.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{tr.admin_payments_empty}</p>
        )}
        {receipts.map((r) => {
          const statusMeta = STATUS_LABEL[r.status]
          return (
            <div
              key={r.id}
              style={{
                display: 'flex',
                gap: 16,
                padding: 16,
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                background: 'var(--color-card)',
              }}
            >
              <div style={{ width: 120, height: 120, flexShrink: 0, background: 'var(--color-secondary)', borderRadius: 6, overflow: 'hidden' }}>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset */}
                    <img src={r.url} alt={tr.admin_payments_receipt_alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="flex items-center gap-2">
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{r.cabinetName ?? tr.admin_payments_unknown_cabinet}</p>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '2px 7px', borderRadius: 3, background: statusMeta.bg, color: statusMeta.color }}>
                    {statusMeta.label}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                  {r.cabinetCity ?? '—'} · {tr.admin_payments_plan_prefix} {r.planName ?? r.planIdFallback} · {r.amount ? `${r.amount} TND` : r.planPriceLabel}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                  {tr.admin_payments_sent_on_prefix} {new Date(r.createdAt).toLocaleString('fr-FR')}
                </p>
                <ReceiptActions receiptId={r.id} currentStatus={r.status} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
