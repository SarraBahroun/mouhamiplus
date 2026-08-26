'use client'

import { INVOICE_STATUS_META, PAYMENT_STATUS_META } from '@/lib/finance-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'
import { useLang } from '@/providers/LangProvider'

export default function ClientInvoicesPage() {
  const { tr } = useLang()
  const { clientProfile } = useClientSession()
  const { invoices, payments } = useAppData()
  const clientInvoices = invoices.filter((i) => i.clientId === clientProfile?.id)
  const clientPayments = payments.filter((p) => p.clientId === clientProfile?.id)
  const outstanding = clientInvoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

  const invoiceStatusLabel: Record<string, string> = {
    paid: tr.client_invoices_status_paid,
    pending: tr.client_invoices_status_pending,
    overdue: tr.client_invoices_status_overdue,
  }
  const paymentStatusLabel: Record<string, string> = {
    completed: tr.client_invoices_payment_status_completed,
    pending: tr.client_invoices_payment_status_pending,
    failed: tr.client_invoices_payment_status_failed,
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.client_invoices_title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {outstanding > 0
              ? tr.client_invoices_outstanding_amount.replace('{amount}', outstanding.toLocaleString('fr-FR'))
              : tr.client_invoices_no_outstanding}
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 10px' }}>{tr.client_invoices_section_title}</h2>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
            {clientInvoices.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>{tr.client_invoices_empty}</div>
            )}
            {clientInvoices.map((inv, i) => {
              const meta = INVOICE_STATUS_META[inv.status]
              return (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: i < clientInvoices.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)', flex: 1 }}>{inv.number}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>{inv.dueAt ? tr.client_invoices_due_date.replace('{date}', new Date(inv.dueAt).toLocaleDateString('fr-FR')) : tr.client_invoices_no_due_date}</span>
                  <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{inv.amount.toLocaleString('fr-FR')} DT</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>{invoiceStatusLabel[inv.status] ?? meta.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 10px' }}>{tr.client_invoices_payments_section_title}</h2>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
            {clientPayments.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>{tr.client_invoices_payments_empty}</div>
            )}
            {clientPayments.map((p, i) => {
              const meta = PAYMENT_STATUS_META[p.status]
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: i < clientPayments.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', flex: 1 }}>{p.method} · {new Date(p.date).toLocaleDateString('fr-FR')}</span>
                  <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{p.amount.toLocaleString('fr-FR')} DT</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: meta.bg, color: meta.color }}>{paymentStatusLabel[p.status] ?? meta.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
