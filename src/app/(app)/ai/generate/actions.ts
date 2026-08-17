'use server'

import { callGemini } from '@/lib/gemini'

const SYSTEM_PROMPT = `Tu rédiges des documents juridiques en français pour des avocats tunisiens, dans un style formel conforme aux usages du barreau tunisien.
Ne produis que le texte du document lui-même (formule d'appel, corps, formule de politesse), sans commentaire ni explication autour.
Quand un détail précis manque (montant, date, nom), utilise un espace réservé entre crochets, ex. [montant], [date].`

const TEMPLATE_LABELS: Record<string, string> = {
  'mise-en-demeure': 'une mise en demeure',
  assignation: 'une assignation en justice',
  conclusions: 'des conclusions',
  'contrat-honoraires': "une convention d'honoraires",
}

export interface GenerateDocInput {
  templateId: string
  caseReference: string
  caseTitle: string
  practiceArea: string
  statusLabel: string
  clientName?: string
}

export type GenerateDocResult = { text: string } | { error: string }

export async function generateLegalDocument(input: GenerateDocInput): Promise<GenerateDocResult> {
  const label = TEMPLATE_LABELS[input.templateId] ?? 'un document juridique'
  const prompt = [
    `Rédige ${label} pour le dossier "${input.caseTitle}" (référence ${input.caseReference}).`,
    `Domaine : ${input.practiceArea}. Statut actuel du dossier : ${input.statusLabel}.`,
    input.clientName ? `Client concerné : ${input.clientName}.` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const text = await callGemini(SYSTEM_PROMPT, prompt)
    return { text }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inconnue.' }
  }
}
