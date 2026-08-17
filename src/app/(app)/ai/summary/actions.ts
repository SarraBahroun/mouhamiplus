'use server'

import { callGemini } from '@/lib/gemini'

const SYSTEM_PROMPT = `Tu résumes des dossiers juridiques pour des avocats tunisiens.
Réponds uniquement par une liste de 3 à 5 phrases courtes en français, une par ligne, sans numérotation ni tirets, résumant l'état du dossier et les points d'attention.`

export interface SummarizeCaseInput {
  reference: string
  title: string
  statusLabel: string
  practiceArea: string
  openedAt: string
  nextHearing?: string
  clientName?: string
  notes: string[]
  messages: string[]
  hearings: string[]
}

export type SummarizeCaseResult = { lines: string[] } | { error: string }

export async function summarizeCase(input: SummarizeCaseInput): Promise<SummarizeCaseResult> {
  const details = [
    `Titre: ${input.title}`,
    `Référence: ${input.reference}`,
    `Statut: ${input.statusLabel}`,
    `Domaine: ${input.practiceArea}`,
    `Ouvert le: ${input.openedAt}`,
    input.clientName ? `Client: ${input.clientName}` : '',
    input.nextHearing ? `Prochaine audience: ${input.nextHearing}` : '',
    input.hearings.length ? `Audiences: ${input.hearings.join(' | ')}` : '',
    input.notes.length ? `Notes: ${input.notes.join(' | ')}` : '',
    input.messages.length ? `Messages récents: ${input.messages.join(' | ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const text = await callGemini(SYSTEM_PROMPT, details)
    const lines = text
      .split('\n')
      .map((l) => l.replace(/^[-•\d.]+\s*/, '').trim())
      .filter(Boolean)
    return { lines: lines.length ? lines : [text] }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inconnue.' }
  }
}
