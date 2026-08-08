'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type InviteClientResult = { tempPassword: string } | { error: string }

export async function inviteClient(clientId: string): Promise<InviteClientResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const admin = createAdminClient()
  const { data: clientRow, error: clientError } = await admin
    .from('clients')
    .select('id, email, name, auth_user_id')
    .eq('id', clientId)
    .single()
  if (clientError || !clientRow) return { error: 'Client introuvable.' }
  if (clientRow.auth_user_id) return { error: "Cet accès a déjà été créé pour ce client." }
  if (!clientRow.email) return { error: "Ce client n'a pas d'adresse e-mail renseignée." }

  const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: clientRow.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { client_name: clientRow.name },
  })
  if (userError || !userData.user) {
    const message = userError?.message?.includes('already been registered')
      ? 'Un compte existe déjà avec cet email.'
      : (userError?.message ?? 'Impossible de créer le compte.')
    return { error: message }
  }

  const { error: updateError } = await admin.from('clients').update({ auth_user_id: userData.user.id }).eq('id', clientId)
  if (updateError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return { error: "Impossible d'associer le compte au client." }
  }

  return { tempPassword }
}
