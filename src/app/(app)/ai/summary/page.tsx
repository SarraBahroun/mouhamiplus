'use client'

import { useState } from 'react'
import { SelectInput } from '@/components/ui/SelectInput'
import { Btn } from '@/components/ui/Btn'
import { useAppData } from '@/providers/AppDataProvider'
import { CASE_STATUS_META } from '@/lib/cases-data'
import { summarizeCase } from './actions'

const FALLBACK_SUMMARY = ["Ce dossier ne contient pas encore assez d'éléments pour générer un résumé détaillé."]

export default function AiSummaryPage() {
  const { cases: initialCases, clients } = useAppData()
  const [caseId, setCaseId] = useState(String(initialCases[0]?.id ?? ''))
  const [shown, setShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string[]>(FALLBACK_SUMMARY)

  const handleSummarize = async () => {
    const c = initialCases.find((x) => String(x.id) === caseId)
    if (!c) return
    setLoading(true)
    const result = await summarizeCase({
      reference: c.reference,
      title: c.title,
      statusLabel: CASE_STATUS_META[c.status]?.label ?? c.status,
      practiceArea: c.practiceArea,
      openedAt: c.openedAt,
      nextHearing: c.nextHearing,
      clientName: clients.find((cl) => cl.id === c.clientId)?.name,
      notes: c.notes.map((n) => n.text),
      messages: c.messages.map((m) => m.text),
      hearings: c.hearings.map((h) => `${h.date} - ${h.court}${h.note ? ` (${h.note})` : ''}`),
    })
    setSummary('lines' in result ? result.lines : FALLBACK_SUMMARY)
    setShown(true)
    setLoading(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
            Résumé automatique
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Obtenez un résumé généré par IA de l&apos;état d&apos;un dossier
          </p>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <div className="flex gap-3 items-end">
            <div style={{ flex: 1 }}>
              <SelectInput
                label="Dossier à résumer"
                value={caseId}
                onChange={(v) => { setCaseId(v); setShown(false) }}
                options={initialCases.map((c) => ({ value: String(c.id), label: c.title }))}
              />
            </div>
            <Btn onClick={handleSummarize} disabled={loading}>{loading ? 'Résumé…' : '✨ Résumer'}</Btn>
          </div>
        </div>

        {shown && (
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: 'var(--color-muted-foreground)' }}>
              RÉSUMÉ IA
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {summary.map((line, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-foreground)' }}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
