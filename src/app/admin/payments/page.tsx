import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { planById } from '@/lib/billing'
import { AdminPaymentsView } from './AdminPaymentsView'

interface ReceiptRow {
  id: string
  plan: string
  amount: number | null
  receipt_path: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
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
    .select('id, plan, amount, receipt_path, created_at, status, cabinets(name, city)')
    .order('created_at', { ascending: false })
    .limit(100)

  const rows = (receipts ?? []) as ReceiptRow[]

  const withUrls = await Promise.all(
    rows.map(async (r) => {
      const { data: signed } = await admin.storage.from('payment-receipts').createSignedUrl(r.receipt_path, 600)
      const cabinet = Array.isArray(r.cabinets) ? r.cabinets[0] : r.cabinets
      const plan = planById(r.plan)
      return {
        id: r.id,
        status: r.status,
        amount: r.amount,
        createdAt: r.created_at,
        cabinetName: cabinet?.name ?? null,
        cabinetCity: cabinet?.city ?? null,
        planName: plan?.name ?? null,
        planPriceLabel: plan?.priceLabel ?? null,
        planIdFallback: r.plan,
        url: signed?.signedUrl ?? null,
      }
    })
  )

  return <AdminPaymentsView receipts={withUrls} />
}
