import nodemailer from 'nodemailer'

/**
 * Envoi d'emails transactionnels métier (hors flux auth Supabase, géré séparément
 * dans le dashboard Supabase → Authentication → Emails → SMTP Settings).
 *
 * Deux fournisseurs possibles, essayés dans cet ordre :
 * - Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD) — gratuit, aucun domaine requis,
 *   ~500 emails/jour, expéditeur = l'adresse Gmail elle-même.
 * - Resend (RESEND_API_KEY + RESEND_FROM_EMAIL) — nécessite un domaine vérifié.
 *
 * Si aucun n'est configuré, échoue silencieusement — un email qui ne part pas ne
 * doit jamais faire échouer l'action métier qui l'a déclenché.
 */
export async function sendTransactionalEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<{ error: string | null }> {
  const gmailUser = process.env.GMAIL_USER
  const gmailPassword = process.env.GMAIL_APP_PASSWORD

  if (gmailUser && gmailPassword) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPassword },
      })
      await transporter.sendMail({
        from: `Mouhami+ <${gmailUser}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })
      return { error: null }
    } catch (err) {
      console.error('sendTransactionalEmail (Gmail) failed', err)
      return { error: err instanceof Error ? err.message : 'gmail_send_failed' }
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const resendFrom = process.env.RESEND_FROM_EMAIL

  if (resendApiKey && resendFrom) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: resendFrom, to: params.to, subject: params.subject, html: params.html }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('sendTransactionalEmail (Resend) failed', res.status, body)
      return { error: body }
    }
    return { error: null }
  }

  console.warn('sendTransactionalEmail: aucun fournisseur configuré (GMAIL_USER/GMAIL_APP_PASSWORD ou RESEND_API_KEY/RESEND_FROM_EMAIL), email non envoyé.')
  return { error: 'not_configured' }
}
