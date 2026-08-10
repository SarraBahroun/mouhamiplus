'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTransactionalEmail } from '@/lib/resend'

async function assertPlatformAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthenticated')

  const { data: adminRow } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!adminRow) throw new Error('forbidden')

  return user.id
}

export async function reviewPaymentReceipt(
  receiptId: string,
  decision: 'approved' | 'rejected'
): Promise<{ error: string | null }> {
  let reviewerId: string
  try {
    reviewerId = await assertPlatformAdmin()
  } catch {
    return { error: "Accès non autorisé." }
  }

  const admin = createAdminClient()

  const { data: receipt, error: receiptError } = await admin
    .from('payment_receipts')
    .select('id, cabinet_id, plan')
    .eq('id', receiptId)
    .single()
  if (receiptError || !receipt) {
    return { error: 'Justificatif introuvable.' }
  }

  const { error: updateReceiptError } = await admin
    .from('payment_receipts')
    .update({ status: decision, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq('id', receiptId)
  if (updateReceiptError) {
    return { error: 'Impossible de mettre à jour le justificatif.' }
  }

  const { error: updateCabinetError } = await admin
    .from('cabinets')
    .update({ subscription_status: decision === 'approved' ? 'active' : 'rejected' })
    .eq('id', receipt.cabinet_id)
  if (updateCabinetError) {
    return { error: "Impossible de mettre à jour l'abonnement du cabinet." }
  }

  const { data: owner } = await admin
    .from('profiles')
    .select('email, first_name')
    .eq('cabinet_id', receipt.cabinet_id)
    .eq('role', 'owner')
    .maybeSingle()

  if (owner?.email) {
    const subject = decision === 'approved' ? 'Votre compte Mouhami+ est activé' : 'Justificatif de paiement refusé'
    const html = decision === 'approved'
      ? `<p>Bonjour ${owner.first_name ?? ''},</p><p>Votre paiement a été validé et votre compte Mouhami+ est maintenant actif. Vous pouvez vous connecter dès maintenant.</p>`
      : `<p>Bonjour ${owner.first_name ?? ''},</p><p>Votre justificatif de virement n'a pas pu être validé. Merci de vous reconnecter et d'envoyer un nouveau justificatif depuis la page de paiement.</p>`
    // Best-effort : un échec d'envoi ne doit pas annuler la décision déjà enregistrée en base.
    await sendTransactionalEmail({ to: owner.email, subject, html })
  }

  revalidatePath('/admin/payments')
  return { error: null }
}
