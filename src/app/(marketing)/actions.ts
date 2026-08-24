'use server'

import { sendTransactionalEmail } from '@/lib/mailer'

const CONTACT_RECIPIENT = 'mouhamiplus@gmail.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export const initialContactFormState: ContactFormState = { status: 'idle', message: '' }

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Piège à bots : ce champ est masqué en CSS, un humain ne le remplit jamais.
  if (String(formData.get('company') ?? '').trim()) {
    return { status: 'success', message: 'Merci, votre message a bien été envoyé.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!name || !email || !message) {
    return { status: 'error', message: 'Merci de remplir tous les champs.' }
  }
  if (!EMAIL_RE.test(email)) {
    return { status: 'error', message: 'Adresse e-mail invalide.' }
  }
  if (name.length > 120 || email.length > 200) {
    return { status: 'error', message: 'Champ trop long.' }
  }
  if (message.length > 4000) {
    return { status: 'error', message: 'Message trop long (4000 caractères max).' }
  }

  const html = `
    <p><strong>Nouveau message depuis le site Mouhami+</strong></p>
    <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
    <p><strong>E-mail :</strong> ${escapeHtml(email)}</p>
    <p><strong>Message :</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
  `.trim()

  const { error } = await sendTransactionalEmail({
    to: CONTACT_RECIPIENT,
    subject: `Nouveau contact — ${name}`,
    html,
  })

  if (error) {
    return {
      status: 'error',
      message: "L'envoi a échoué. Réessayez, ou écrivez-nous directement à mouhamiplus@gmail.com.",
    }
  }

  return { status: 'success', message: 'Merci, votre message a bien été envoyé. Nous vous répondons sous 24h.' }
}
