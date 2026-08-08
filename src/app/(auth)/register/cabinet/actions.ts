'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteOrigin } from '@/lib/site-url'

export interface RegisterCabinetInput {
  cabinetName: string
  taxId: string
  city: string
  size: string
  adminFirst: string
  adminLast: string
  email: string
  phone: string
  password: string
}

export async function registerCabinet(input: RegisterCabinetInput): Promise<{ error: string | null }> {
  const { cabinetName, taxId, city, size, adminFirst, adminLast, email, phone, password } = input

  if (!cabinetName || !adminFirst || !adminLast || !email || !password) {
    return { error: 'Merci de remplir tous les champs obligatoires.' }
  }
  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
  }

  const admin = createAdminClient()

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { first_name: adminFirst, last_name: adminLast },
  })
  if (userError || !userData.user) {
    const message = userError?.message?.includes('already been registered')
      ? 'Un compte existe déjà avec cet email.'
      : (userError?.message ?? 'Impossible de créer le compte.')
    return { error: message }
  }

  const { data: cabinet, error: cabinetError } = await admin
    .from('cabinets')
    .insert({ name: cabinetName, tax_id: taxId || null, city: city || null, size: size || null })
    .select('id')
    .single()

  if (cabinetError || !cabinet) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return { error: "Impossible de créer le cabinet." }
  }

  const avatar = `${adminFirst[0] ?? ''}${adminLast[0] ?? ''}`.toUpperCase() || '??'

  const { error: profileError } = await admin.from('profiles').insert({
    id: userData.user.id,
    cabinet_id: cabinet.id,
    first_name: adminFirst,
    last_name: adminLast,
    role: 'owner',
    email,
    phone: phone || null,
    avatar,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return { error: "Impossible de créer le profil." }
  }

  const supabase = await createClient()
  const origin = await getSiteOrigin()
  const { error: resendError } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/register/cabinet/team')}` },
  })
  if (resendError) {
    return { error: "Compte créé, mais l'envoi de l'email de vérification a échoué. Réessayez depuis la page de connexion." }
  }

  return { error: null }
}
