'use server'

import { createClient } from '@/lib/supabase/server'
import { planById } from '@/lib/billing'

const MAX_RECEIPT_SIZE = 8 * 1024 * 1024

export async function submitPaymentReceipt(formData: FormData): Promise<{ error: string | null }> {
  const planId = String(formData.get('plan') ?? '')
  const file = formData.get('file') as File | null

  const plan = planById(planId)
  if (!plan) {
    return { error: 'Forfait invalide.' }
  }
  if (!file || file.size === 0) {
    return { error: 'Merci de joindre une photo du justificatif de virement.' }
  }
  if (file.size > MAX_RECEIPT_SIZE) {
    return { error: 'Le fichier est trop volumineux (8 Mo maximum).' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Session expirée. Merci de vous reconnecter.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('cabinet_id')
    .eq('id', user.id)
    .single()
  if (profileError || !profile) {
    return { error: 'Profil introuvable.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${profile.cabinet_id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('payment-receipts')
    .upload(path, file, { contentType: file.type || 'image/jpeg' })
  if (uploadError) {
    return { error: "Impossible d'envoyer le fichier. Réessayez." }
  }

  const { error: insertError } = await supabase.from('payment_receipts').insert({
    cabinet_id: profile.cabinet_id,
    plan: plan.id,
    amount: plan.price,
    receipt_path: path,
  })
  if (insertError) {
    return { error: "Impossible d'enregistrer le justificatif." }
  }

  const { error: updateError } = await supabase
    .from('cabinets')
    .update({ plan: plan.id, subscription_status: 'pending_review' })
    .eq('id', profile.cabinet_id)
  if (updateError) {
    return { error: "Impossible de mettre à jour l'abonnement." }
  }

  return { error: null }
}
