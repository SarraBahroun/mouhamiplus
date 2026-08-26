const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// API Gemini gratuite (Google AI Studio) — utilisée tant que l'app est en phase
// prototype/démo/validation. À revoir si l'app passe en production à plus grande échelle.
export async function callGemini(systemInstruction: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("Clé GEMINI_API_KEY manquante côté serveur.")

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemini API a répondu ${res.status}: ${detail.slice(0, 300)}`)
  }

  const data = await res.json()
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
  if (!text.trim()) throw new Error('Réponse Gemini vide.')
  return text.trim()
}

// Variante vision : envoie une image (OCR, analyse de document). Contrairement à
// callGemini, une réponse vide est valide ici (page blanche) et le plafond de sortie
// est large (un document juridique transcrit dépasse vite 1024 tokens).
export async function callGeminiVision(
  systemInstruction: string,
  userPrompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("Clé GEMINI_API_KEY manquante côté serveur.")

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [
        {
          role: 'user',
          parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: userPrompt }],
        },
      ],
      generationConfig: { temperature: 0, maxOutputTokens: 8192 },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemini API a répondu ${res.status}: ${detail.slice(0, 300)}`)
  }

  const data = await res.json()
  return (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim()
}
