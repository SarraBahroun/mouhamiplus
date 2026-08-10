/**
 * Envoi d'emails transactionnels métier (hors flux auth Supabase) via l'API Resend.
 * Nécessite RESEND_API_KEY + RESEND_FROM_EMAIL (adresse sur un domaine vérifié
 * dans Resend). Tant que ce n'est pas configuré, échoue silencieusement — un email
 * qui ne part pas ne doit jamais faire échouer l'action métier qui l'a déclenché.
 */
export async function sendTransactionalEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<{ error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !from) {
    console.warn('sendTransactionalEmail: RESEND_API_KEY ou RESEND_FROM_EMAIL manquant, email non envoyé.')
    return { error: 'not_configured' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: params.to, subject: params.subject, html: params.html }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('sendTransactionalEmail failed', res.status, body)
    return { error: body }
  }

  return { error: null }
}
