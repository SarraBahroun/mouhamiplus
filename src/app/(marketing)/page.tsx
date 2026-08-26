import { redirect } from 'next/navigation'
import { HomeContent } from '@/components/marketing/HomeContent'
import { createClient } from '@/lib/supabase/server'

export default async function MarketingHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
    if (profile) redirect('/dashboard')
    const { data: client } = await supabase.from('clients').select('id').eq('auth_user_id', user.id).maybeSingle()
    if (client) redirect('/espace-client/dashboard')
  }

  return <HomeContent />
}
