'use server'

import { createClient } from '@/lib/supabase/server'
import { planById } from '@/lib/billing'

export async function selectPlan(planId: string): Promise<{ error: string | null }> {
  const plan = planById(planId)
  if (!plan) {
    return { error: 'Forfait invalide.' }
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

  if (plan.maxUsers !== null) {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('cabinet_id', profile.cabinet_id)
    if ((count ?? 0) > plan.maxUsers) {
      return {
        error: `Le forfait ${plan.name} est limité à ${plan.maxUsers} utilisateur${plan.maxUsers > 1 ? 's' : ''}, mais votre cabinet en compte déjà ${count}. Choisissez un forfait supérieur, ou retirez des membres.`,
      }
    }
  }

  const { error: updateError } = await supabase
    .from('cabinets')
    .update({ plan: plan.id })
    .eq('id', profile.cabinet_id)
  if (updateError) {
    return { error: "Impossible d'enregistrer le forfait." }
  }

  return { error: null }
}
