'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface InviteMemberInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'secretary' | 'collaborator' | 'intern'
  supervisorId?: string | null
}

export type InviteMemberResult = { id: string; tempPassword: string } | { error: string }

export async function inviteMember(input: InviteMemberInput): Promise<InviteMemberResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: myProfile } = await supabase.from('profiles').select('cabinet_id').eq('id', user.id).single()
  if (!myProfile) return { error: 'Profil introuvable.' }

  const { data: allowed } = await supabase.rpc('auth_permission', { perm: 'manageUsers' })
  if (!allowed) return { error: "Vous n'avez pas la permission d'ajouter des membres." }

  const admin = createAdminClient()
  const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 12)

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: input.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { first_name: input.firstName, last_name: input.lastName },
  })
  if (userError || !userData.user) {
    const message = userError?.message?.includes('already been registered')
      ? 'Un compte existe déjà avec cet email.'
      : (userError?.message ?? 'Impossible de créer le compte.')
    return { error: message }
  }

  const avatar = `${input.firstName[0] ?? ''}${input.lastName[0] ?? ''}`.toUpperCase() || '??'

  const { error: profileError } = await admin.from('profiles').insert({
    id: userData.user.id,
    cabinet_id: myProfile.cabinet_id,
    first_name: input.firstName,
    last_name: input.lastName,
    role: input.role,
    email: input.email,
    phone: input.phone || null,
    supervisor_id: input.supervisorId || null,
    avatar,
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return { error: 'Impossible de créer le profil.' }
  }

  return { id: userData.user.id, tempPassword }
}
