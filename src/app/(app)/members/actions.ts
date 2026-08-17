'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendTransactionalEmail } from '@/lib/mailer'

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

export type ResetMemberPasswordResult = { tempPassword: string; emailed: boolean } | { error: string }

export async function resetMemberPassword(memberId: string): Promise<ResetMemberPasswordResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: myProfile } = await supabase.from('profiles').select('cabinet_id').eq('id', user.id).single()
  if (!myProfile) return { error: 'Profil introuvable.' }

  const { data: allowed } = await supabase.rpc('auth_permission', { perm: 'manageUsers' })
  if (!allowed) return { error: "Vous n'avez pas la permission de gérer les membres." }

  const admin = createAdminClient()
  const { data: memberRow, error: memberError } = await admin
    .from('profiles')
    .select('id, email, first_name, cabinet_id')
    .eq('id', memberId)
    .single()
  if (memberError || !memberRow) return { error: 'Membre introuvable.' }
  if (memberRow.cabinet_id !== myProfile.cabinet_id) return { error: "Ce membre n'appartient pas à votre cabinet." }

  const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const { error: updateError } = await admin.auth.admin.updateUserById(memberId, { password: tempPassword })
  if (updateError) return { error: updateError.message ?? 'Impossible de réinitialiser le mot de passe.' }

  if (!memberRow.email) return { tempPassword, emailed: false }

  const { error: emailError } = await sendTransactionalEmail({
    to: memberRow.email,
    subject: 'Votre mot de passe Mouhami+ a été réinitialisé',
    html: `<p>Bonjour ${memberRow.first_name ?? ''},</p>
<p>Votre mot de passe Mouhami+ a été réinitialisé par un administrateur de votre cabinet.</p>
<p>Nouveau mot de passe temporaire : <strong>${tempPassword}</strong></p>
<p>Connectez-vous puis pensez à le changer.</p>`,
  })

  return { tempPassword, emailed: !emailError }
}
