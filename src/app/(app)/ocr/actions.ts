'use server'

import { callGeminiVision } from '@/lib/gemini'

const SYSTEM_PROMPT = `Tu es un moteur OCR de haute précision pour un cabinet d'avocats tunisien.
On t'envoie la photo ou le scan d'une page de document (souvent juridique, en arabe ou en français).
Transcris fidèlement TOUT le texte visible, exactement comme il est écrit :
- dans sa langue d'origine, sans traduire ;
- en préservant les sauts de ligne et l'ordre de lecture ;
- sans rien ajouter : aucun commentaire, aucun titre, aucune mise en forme markdown ;
- ne corrige pas les fautes du document, ne complète pas les mots illisibles (mets […] à leur place).
Si la page ne contient aucun texte, renvoie une réponse vide.`

const LANG_HINTS: Record<string, string> = {
  ara: 'Le document est en arabe.',
  fra: 'Le document est en français.',
  'fra+ara': "Le document peut mélanger l'arabe et le français.",
}

export type TranscribeResult = { text: string } | { error: string }

export async function transcribeDocument(imageDataUrl: string, langHint: string): Promise<TranscribeResult> {
  const match = imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)
  if (!match) return { error: 'Image invalide.' }
  const [, mimeType, base64] = match

  try {
    const raw = await callGeminiVision(
      SYSTEM_PROMPT,
      `${LANG_HINTS[langHint] ?? LANG_HINTS['fra+ara']} Transcris cette page.`,
      base64,
      mimeType
    )
    // Gemini emballe parfois sa réponse dans des clôtures markdown malgré la consigne.
    const text = raw.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim()
    return { text }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inconnue.' }
  }
}
