'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { askLegalAssistant } from './actions'

interface ChatMessage {
  id: number
  from: 'user' | 'ai'
  text: string
}

const RULES: { keywords: string[]; replyKey: string }[] = [
  {
    keywords: ['délai', 'delai', 'prescription'],
    replyKey: 'ai_assistant_reply_prescription',
  },
  {
    keywords: ['facture', 'paiement', 'payer', 'régler', 'regler'],
    replyKey: 'ai_assistant_reply_invoices',
  },
  {
    keywords: ['audience', 'rdv', 'rendez-vous', 'rendez vous', 'calendrier'],
    replyKey: 'ai_assistant_reply_hearings',
  },
  {
    keywords: ['document', 'modèle', 'modele', 'générer', 'generer', 'rédiger', 'rediger'],
    replyKey: 'ai_assistant_reply_documents',
  },
  {
    keywords: ['client'],
    replyKey: 'ai_assistant_reply_clients',
  },
  {
    keywords: ['dossier', 'affaire'],
    replyKey: 'ai_assistant_reply_cases',
  },
]

function getReply(question: string, tr: Record<string, string>): string {
  const q = question.toLowerCase()
  const match = RULES.find((r) => r.keywords.some((k) => q.includes(k)))
  return match ? tr[match.replyKey] : tr.ai_assistant_fallback_reply
}

export default function AiAssistantPage() {
  const { tr } = useLang()
  const SUGGESTED_QUESTIONS = [
    tr.ai_assistant_suggested_q1,
    tr.ai_assistant_suggested_q2,
    tr.ai_assistant_suggested_q3,
    tr.ai_assistant_suggested_q4,
  ]
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 1, from: 'ai', text: tr.ai_assistant_greeting }])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async (question: string) => {
    if (!question.trim() || loading) return
    const nextId = messages[messages.length - 1].id + 1
    setMessages((m) => [...m, { id: nextId, from: 'user', text: question }])
    setDraft('')
    setLoading(true)
    const result = await askLegalAssistant(question)
    const reply = 'reply' in result ? result.reply : getReply(question, tr)
    setMessages((m) => [...m, { id: nextId + 1, from: 'ai', text: reply }])
    setLoading(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
            {tr.nav_ai_assistant}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {tr.ai_assistant_subtitle}
          </p>
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 20,
                  background: 'var(--color-card)',
                  color: 'var(--color-muted-foreground)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-muted-foreground)' }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minHeight: 360,
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '10px 13px',
                borderRadius: 10,
                fontSize: 13,
                lineHeight: 1.5,
                background: m.from === 'user' ? 'var(--color-primary)' : 'var(--color-secondary)',
                color: m.from === 'user' ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
              }}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div
              style={{
                alignSelf: 'flex-start',
                maxWidth: '80%',
                padding: '10px 13px',
                borderRadius: 10,
                fontSize: 13,
                fontStyle: 'italic',
                color: 'var(--color-muted-foreground)',
                background: 'var(--color-secondary)',
              }}
            >
              {tr.ai_assistant_thinking}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask(draft)}
            placeholder={tr.ai_assistant_input_placeholder}
            disabled={loading}
            style={{
              flex: 1,
              padding: '11px 14px',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              background: 'var(--color-card)',
              outline: 'none',
              color: 'var(--color-foreground)',
            }}
          />
          <Btn onClick={() => ask(draft)} disabled={loading}>{tr.common_send}</Btn>
        </div>
      </div>
    </div>
  )
}
