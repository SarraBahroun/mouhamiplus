'use server'

import { callGemini } from '@/lib/gemini'

const SYSTEM_PROMPT = `Tu es l'assistant juridique IA de Mouhami+, une plateforme de gestion pour cabinets d'avocats en Tunisie.
Réponds toujours en français, de façon claire, concise et professionnelle (5 phrases maximum).
Base-toi sur le droit tunisien lorsque la question porte sur un point de droit, et précise qu'il s'agit d'une orientation générale, pas d'un conseil juridique définitif.
Si la question porte sur l'utilisation de l'application elle-même (factures, audiences, dossiers, clients, documents, paiements), oriente l'utilisateur vers la section correspondante de Mouhami+.`

export type AskAssistantResult = { reply: string } | { error: string }

export async function askLegalAssistant(question: string): Promise<AskAssistantResult> {
  const trimmed = question.trim()
  if (!trimmed) return { error: 'Question vide.' }

  try {
    const reply = await callGemini(SYSTEM_PROMPT, trimmed)
    return { reply }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inconnue.' }
  }
}
