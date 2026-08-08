import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { planById } from '@/lib/billing'
import { ReceiptActions } from './ReceiptActions'

interface ReceiptRow {
  id: string
  plan: string
  amount: number | null
  receipt_path: string
  created_at: string
  cabinets: { name: string; city: string | null } | { name: string; city: string | null }[] | null
}

export default async function AdminPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!adminRow) redirect('/login')

  const admin = createAdminClient()
  const { data: receipts } = await admin
    .from('payment_receipts')
    .select('id, plan, amount, receipt_path, created_at, cabinets(name, city)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const rows = (receipts ?? []) as ReceiptRow[]

  const withUrls = await Promise.all(
    rows.map(async (r) => {
      const { data: signed } = await admin.storage.from('payment-receipts').createSignedUrl(r.receipt_path, 600)
      const cabinet = Array.isArray(r.cabinets) ? r.cabinets[0] : r.cabinets
      return { ...r, cabinet, url: signed?.signedUrl ?? null }
    })
  )

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>
        Justificatifs de paiement en attente
      </h1>
      <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: '0 0 24px' }}>
        {withUrls.length} justificatif{withUrls.length > 1 ? 's' : ''} à vérifier.
      </p>

      <div className="flex flex-col gap-3">
        {withUrls.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Aucun justificatif en attente.</p>
        )}
        {withUrls.map((r) => {
          const plan = planById(r.plan)
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
                    <img src={r.url} alt="Justificatif de virement" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{r.cabinet?.name ?? 'Cabinet inconnu'}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                  {r.cabinet?.city ?? '—'} · Forfait {plan?.name ?? r.plan} · {r.amount ? `${r.amount} TND` : plan?.priceLabel}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                  Envoyé le {new Date(r.created_at).toLocaleString('fr-FR')}
                </p>
                <ReceiptActions receiptId={r.id} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
