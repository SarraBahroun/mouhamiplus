import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionGate } from '@/components/layout/SubscriptionGate'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('cabinet_id, cabinets(subscription_status, plan)')
    .eq('id', user.id)
    .single()

  const cabinet = profile ? (Array.isArray(profile.cabinets) ? profile.cabinets[0] : profile.cabinets) : null
  const status = cabinet?.subscription_status ?? null

  if (status && status !== 'active') {
    return <SubscriptionGate status={status} plan={cabinet?.plan ?? null} />
  }

  return <AppShell>{children}</AppShell>
}
