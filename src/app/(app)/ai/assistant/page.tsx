'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { askLegalAssistant } from './actions'

interface ChatMessage {
  id: number
  from: 'user' | 'ai'
  text: string
}

const INITIAL: ChatMessage[] = [
  { id: 1, from: 'ai', text: 'Bonjour Maître, je suis votre assistant juridique. Comment puis-je vous aider aujourd\'hui ?' },
]

const RULES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ['délai', 'delai', 'prescription'],
    reply: 'En droit tunisien, le délai de prescription de droit commun pour les actions personnelles, y compris en responsabilité contractuelle, est de quinze (15) ans (article 402 du Code des obligations et des contrats), sauf délais spéciaux prévus par des textes particuliers.',
  },
  {
    keywords: ['facture', 'paiement', 'payer', 'régler', 'regler'],
    reply: "Vous pouvez consulter le détail de vos factures dans la section Factures et l'historique des paiements dans Paiements, accessibles depuis le menu.",
  },
  {
    keywords: ['audience', 'rdv', 'rendez-vous', 'rendez vous', 'calendrier'],
    reply: 'Les prochaines audiences sont listées dans Audiences, et une vue mensuelle est disponible dans Calendrier.',
  },
  {
    keywords: ['document', 'modèle', 'modele', 'générer', 'generer', 'rédiger', 'rediger'],
    reply: 'Vous pouvez générer un document juridique (mise en demeure, assignation, conclusions…) à partir d\'un modèle depuis Génération de documents par IA.',
  },
  {
    keywords: ['client'],
    reply: 'Toutes les fiches clients, avec leurs dossiers, documents et paiements, sont accessibles depuis la section Clients.',
  },
  {
    keywords: ['dossier', 'affaire'],
    reply: 'La liste de vos dossiers, avec leur statut et prochaine audience, se trouve dans la section Dossiers.',
  },
]

const FALLBACK_REPLY = "Je note votre question. Dans une version complète, je consulterais la base juridique du cabinet et la jurisprudence pertinente pour vous fournir une réponse détaillée et sourcée."

const SUGGESTED_QUESTIONS = [
  'Quel est le délai de prescription pour une action contractuelle ?',
  'Où voir mes prochaines audiences ?',
  'Comment générer une mise en demeure ?',
  'Où consulter mes factures en attente ?',
]

function getReply(question: string): string {
  const q = question.toLowerCase()
  const match = RULES.find((r) => r.keywords.some((k) => q.includes(k)))
  return match?.reply ?? FALLBACK_REPLY
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async (question: string) => {
    if (!question.trim() || loading) return
    const nextId = messages[messages.length - 1].id + 1
    setMessages((m) => [...m, { id: nextId, from: 'user', text: question }])
    setDraft('')
    setLoading(true)
    const result = await askLegalAssistant(question)
    const reply = 'reply' in result ? result.reply : getReply(question)
    setMessages((m) => [...m, { id: nextId + 1, from: 'ai', text: reply }])
    setLoading(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
            Assistant juridique IA
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Posez une question juridique ou demandez de l&apos;aide sur un dossier
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
              L&apos;assistant réfléchit…
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask(draft)}
            placeholder="Posez votre question…"
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
          <Btn onClick={() => ask(draft)} disabled={loading}>Envoyer</Btn>
        </div>
      </div>
    </div>
  )
}
