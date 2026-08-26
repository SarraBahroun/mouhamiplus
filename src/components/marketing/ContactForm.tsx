'use client'

import { useActionState } from 'react'
import { sendContactMessage, type ContactFormState } from '@/app/(marketing)/actions'
import { useLang } from '@/providers/LangProvider'
import { TYPE } from './theme'

// Une constante objet ne peut pas être exportée depuis un fichier 'use server' (seules les
// fonctions async le peuvent) — elle vit ici, côté client, plutôt que dans actions.ts.
const initialContactFormState: ContactFormState = { status: 'idle', message: '' }

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(251,243,229,0.08)',
  border: '1px solid rgba(251,243,229,0.22)',
  borderRadius: 6,
  padding: '10px 12px',
  fontSize: TYPE.body,
  color: 'var(--color-cream)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11.5,
  color: 'var(--color-sky-soft)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
  display: 'block',
}

export function ContactForm() {
  const { tr } = useLang()
  const [state, formAction, pending] = useActionState(sendContactMessage, initialContactFormState)

  return (
    <div
      style={{
        background: 'var(--color-navy)',
        borderRadius: 12,
        padding: '32px 28px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: TYPE.cardTitle, fontWeight: 600, margin: '0 0 4px', color: 'var(--color-cream)' }}>
          {tr.mk_contact_form_title}
        </h3>
        <p style={{ fontSize: TYPE.small, color: 'var(--color-sky-soft)', margin: 0 }}>
          {tr.mk_contact_form_sub}
        </p>
      </div>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Piège à bots, invisible pour un humain */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />

        <div>
          <label htmlFor="contact-name" style={labelStyle}>{tr.common_name}</label>
          <input id="contact-name" name="name" type="text" required maxLength={120} style={inputStyle} disabled={pending} />
        </div>

        <div>
          <label htmlFor="contact-email" style={labelStyle}>{tr.common_email}</label>
          <input id="contact-email" name="email" type="email" required maxLength={200} style={inputStyle} disabled={pending} />
        </div>

        <div>
          <label htmlFor="contact-message" style={labelStyle}>{tr.mk_contact_form_message_label}</label>
          <textarea
            id="contact-message"
            name="message"
            required
            maxLength={4000}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 88 }}
            disabled={pending}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          style={{
            background: 'var(--color-cream)',
            color: 'var(--color-navy)',
            fontSize: TYPE.body,
            fontWeight: 600,
            padding: '11px 16px',
            borderRadius: 6,
            border: 'none',
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? tr.mk_contact_form_sending : tr.common_send}
        </button>

        {state.status !== 'idle' && (
          <p
            role="status"
            aria-live="polite"
            style={{
              fontSize: TYPE.small,
              margin: 0,
              color: state.status === 'success' ? 'var(--color-sky)' : '#E8A0A0',
            }}
          >
            {state.message}
          </p>
        )}
      </form>
    </div>
  )
}
