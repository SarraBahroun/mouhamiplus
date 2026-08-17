import { redirect } from 'next/navigation'
import { ClientShell } from '@/components/layout/ClientShell'
import { ClientSessionProvider } from '@/providers/ClientSessionProvider'
import { createClient } from '@/lib/supabase/server'

export default async function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/espace-client/login')
  }

  const { data: client } = await supabase.from('clients').select('id').eq('auth_user_id', user.id).maybeSingle()
  if (!client) {
    redirect('/espace-client/login')
  }

  return (
    <ClientSessionProvider>
      <ClientShell>{children}</ClientShell>
    </ClientSessionProvider>
  )
}
