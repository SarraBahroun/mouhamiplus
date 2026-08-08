'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface RegisterIndividualInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  barNumber: string
  barRegion: string
  password: string
  firmName: string
  address: string
  city: string
  firmPhone: string
}

export async function registerIndividual(input: RegisterIndividualInput): Promise<{ error: string | null }> {
  const { firstName, lastName, email, phone, barNumber, barRegion, password, firmName, address, city, firmPhone } = input

  if (!firstName || !lastName || !email || !password) {
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
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      bar_number: barNumber || null,
      bar_region: barRegion || null,
    },
  })
  if (userError || !userData.user) {
    const message = userError?.message?.includes('already been registered')
      ? 'Un compte existe déjà avec cet email.'
      : (userError?.message ?? 'Impossible de créer le compte.')
    return { error: message }
  }

  const cabinetName = firmName || `${firstName} ${lastName}`

  const { data: cabinet, error: cabinetError } = await admin
    .from('cabinets')
    .insert({ name: cabinetName, city: city || null, address: address || null, phone: firmPhone || null, size: '1-2' })
    .select('id')
    .single()

  if (cabinetError || !cabinet) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return { error: 'Impossible de créer le cabinet.' }
  }

  const avatar = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '??'

  const { error: profileError } = await admin.from('profiles').insert({
    id: userData.user.id,
    cabinet_id: cabinet.id,
    first_name: firstName,
    last_name: lastName,
    role: 'owner',
    email,
    phone: phone || null,
    avatar,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return { error: 'Impossible de créer le profil.' }
  }

  const supabase = await createClient()
  const { error: resendError } = await supabase.auth.resend({ type: 'signup', email })
  if (resendError) {
    return { error: "Compte créé, mais l'envoi du code de vérification a échoué. Réessayez depuis la page de connexion." }
  }

  return { error: null }
}
