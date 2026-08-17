'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendTransactionalEmail } from '@/lib/mailer'

export type InviteClientResult = { tempPassword: string; emailed: boolean; loginId?: string } | { error: string }

function generateLoginId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '') || 'client'
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6)
  return `${slug}.${suffix}@acces.mouhamiplus.tn`
}

export async function inviteClient(clientId: string): Promise<InviteClientResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: allowed } = await supabase.rpc('auth_permission', { perm: 'manageClients' })
  if (!allowed) return { error: "Vous n'avez pas la permission de gérer les accès clients." }

  const admin = createAdminClient()
  const { data: clientRow, error: clientError } = await admin
    .from('clients')
    .select('id, email, name, auth_user_id')
    .eq('id', clientId)
    .single()
  if (clientError || !clientRow) return { error: 'Client introuvable.' }
  if (clientRow.auth_user_id) return { error: "Cet accès a déjà été créé pour ce client." }

  // Sans email réel, on génère un identifiant de connexion (adresse factice, jamais utilisée
  // pour un envoi) — le mot de passe et l'identifiant doivent alors être transmis à la main.
  const hasRealEmail = Boolean(clientRow.email)
  const loginEmail = hasRealEmail ? (clientRow.email as string) : generateLoginId(clientRow.name)

  const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: loginEmail,
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

  if (!hasRealEmail) {
    return { tempPassword, emailed: false, loginId: loginEmail }
  }

  const { error: emailError } = await sendTransactionalEmail({
    to: loginEmail,
    subject: 'Votre accès à votre espace client Mouhami+',
    html: `<p>Bonjour ${clientRow.name},</p>
<p>Votre cabinet vous a créé un accès à votre espace client Mouhami+.</p>
<p>Identifiants de connexion :</p>
<ul>
  <li>Email : ${loginEmail}</li>
  <li>Mot de passe temporaire : <strong>${tempPassword}</strong></li>
</ul>
<p>Connectez-vous depuis la page espace client et pensez à changer ce mot de passe.</p>`,
  })

  return { tempPassword, emailed: !emailError, loginId: emailError ? loginEmail : undefined }
}

export type ResetClientPasswordResult = { tempPassword: string; emailed: boolean; loginEmail: string } | { error: string }

export async function resetClientPassword(clientId: string): Promise<ResetClientPasswordResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: allowed } = await supabase.rpc('auth_permission', { perm: 'manageClients' })
  if (!allowed) return { error: "Vous n'avez pas la permission de gérer les accès clients." }

  const admin = createAdminClient()
  const { data: clientRow, error: clientError } = await admin
    .from('clients')
    .select('id, email, name, auth_user_id')
    .eq('id', clientId)
    .single()
  if (clientError || !clientRow) return { error: 'Client introuvable.' }
  if (!clientRow.auth_user_id) return { error: "Aucun accès n'a encore été créé pour ce client." }

  const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const { data: userData, error: updateError } = await admin.auth.admin.updateUserById(clientRow.auth_user_id, { password: tempPassword })
  if (updateError || !userData.user) {
    return { error: updateError?.message ?? 'Impossible de réinitialiser le mot de passe.' }
  }

  const loginEmail = userData.user.email ?? clientRow.email ?? ''
  const hasRealEmail = Boolean(clientRow.email)

  if (!hasRealEmail) {
    return { tempPassword, emailed: false, loginEmail }
  }

  const { error: emailError } = await sendTransactionalEmail({
    to: loginEmail,
    subject: 'Votre mot de passe Mouhami+ a été réinitialisé',
    html: `<p>Bonjour ${clientRow.name},</p>
<p>Votre cabinet a réinitialisé le mot de passe de votre espace client Mouhami+.</p>
<p>Identifiants de connexion :</p>
<ul>
  <li>Email : ${loginEmail}</li>
  <li>Nouveau mot de passe temporaire : <strong>${tempPassword}</strong></li>
</ul>
<p>Connectez-vous depuis la page espace client et pensez à changer ce mot de passe.</p>`,
  })

  return { tempPassword, emailed: !emailError, loginEmail }
}
