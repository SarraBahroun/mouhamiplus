'use server'

import { callGemini, callGeminiVision } from '@/lib/gemini'

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

// ---------------------------------------------------------------------------
// Analyse intelligente : à partir du texte extrait, identifier de quoi parle le
// document et à quel client / dossier du cabinet il appartient.
// ---------------------------------------------------------------------------

export interface AnalyzeClientCandidate {
  id: string
  name: string
}

export interface AnalyzeCaseCandidate {
  id: string
  reference: string
  title: string
  clientId: string
  clientName: string
  practiceArea: string
}

export interface DocumentAnalysis {
  docType: string
  summary: string
  clientId: string | null
  caseId: string | null
  reason: string
}

export type AnalyzeResult = { analysis: DocumentAnalysis } | { error: string }

const ANALYZE_SYSTEM_PROMPT = `Tu es l'assistant documentaire d'un cabinet d'avocats tunisien.
On te donne le texte extrait (OCR) d'un document scanné — souvent juridique, en arabe ou en français —
ainsi que la liste des clients et des dossiers du cabinet.
Ta mission :
1. Identifier le type de document (ex. : jugement, assignation, contrat, procès-verbal, facture, courrier…).
2. Résumer son contenu en une ou deux phrases.
3. Déterminer, si possible, à quel client et à quel dossier du cabinet il se rattache, en te basant
   sur les noms, références et sujets qui apparaissent dans le texte.
Règles STRICTES :
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour et sans clôture markdown.
- Format : {"docType": string, "summary": string, "clientId": string|null, "caseId": string|null, "reason": string}
- "clientId" et "caseId" doivent être des identifiants EXACTS copiés depuis les listes fournies, ou null.
- Ne devine pas : si aucun client ou dossier ne correspond clairement, mets null. Un simple doute = null.
- Si le dossier est identifié, le client doit être celui de ce dossier.
- "reason" : une phrase expliquant ce qui, dans le texte, t'a permis de faire le rapprochement (ou pourquoi aucun rapprochement n'est possible).`

const OUTPUT_LANG_NAMES: Record<string, string> = {
  fr: 'français',
  ar: 'arabe',
  en: 'anglais',
}

// Au-delà, le début + la fin suffisent largement à identifier le document, et on
// évite d'envoyer un texte énorme (PDF multi-pages) dans le prompt.
const MAX_ANALYZE_TEXT = 12000

export async function analyzeScannedDocument(input: {
  text: string
  lang: string
  clients: AnalyzeClientCandidate[]
  cases: AnalyzeCaseCandidate[]
}): Promise<AnalyzeResult> {
  const text = input.text.trim()
  if (!text) return { error: 'Aucun texte à analyser.' }

  const truncated =
    text.length > MAX_ANALYZE_TEXT
      ? `${text.slice(0, MAX_ANALYZE_TEXT * 0.75)}\n[…]\n${text.slice(-MAX_ANALYZE_TEXT * 0.25)}`
      : text

  const outputLang = OUTPUT_LANG_NAMES[input.lang] ?? OUTPUT_LANG_NAMES.ar

  const clientsList = input.clients.map((c) => `- id: ${c.id} | nom: ${c.name}`).join('\n') || '(aucun client)'
  const casesList =
    input.cases
      .map(
        (c) =>
          `- id: ${c.id} | référence: ${c.reference} | titre: ${c.title} | client: ${c.clientName} (id client: ${c.clientId}) | domaine: ${c.practiceArea}`
      )
      .join('\n') || '(aucun dossier)'

  const userPrompt = `Écris "docType", "summary" et "reason" en ${outputLang}.

CLIENTS DU CABINET :
${clientsList}

DOSSIERS DU CABINET :
${casesList}

TEXTE EXTRAIT DU DOCUMENT :
${truncated}`

  try {
    const raw = await callGemini(ANALYZE_SYSTEM_PROMPT, userPrompt)
    const jsonText = raw.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(jsonText) as Partial<DocumentAnalysis>
    if (typeof parsed.docType !== 'string' || typeof parsed.summary !== 'string') {
      return { error: 'Réponse IA invalide.' }
    }

    // On ne fait jamais confiance aux ids renvoyés : ils doivent exister dans les
    // listes fournies, et le client suggéré doit être cohérent avec le dossier.
    const matchedCase = input.cases.find((c) => c.id === parsed.caseId) ?? null
    let clientId = input.clients.some((c) => c.id === parsed.clientId) ? (parsed.clientId as string) : null
    if (matchedCase) clientId = matchedCase.clientId

    return {
      analysis: {
        docType: parsed.docType.trim(),
        summary: parsed.summary.trim(),
        clientId,
        caseId: matchedCase?.id ?? null,
        reason: typeof parsed.reason === 'string' ? parsed.reason.trim() : '',
      },
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur inconnue.' }
  }
}
