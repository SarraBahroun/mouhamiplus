'use client'

import { useState } from 'react'
import { SelectInput } from '@/components/ui/SelectInput'
import { Btn } from '@/components/ui/Btn'
import { useAppData } from '@/providers/AppDataProvider'

const SUMMARIES: Record<number, string[]> = {
  1: [
    'Litige commercial opposant Karim Bensalem à la Société TechTun, ouvert le 02/04/2023.',
    'Le contrat initial de 2021 est au cœur du différend ; les échanges de courriels montrent un désaccord sur l\'exécution des obligations contractuelles.',
    'Une audience de plaidoirie est fixée au 18/06/2024. Les conclusions en réplique doivent être déposées avant cette date.',
  ],
  3: [
    'Litige immobilier concernant Fedoua Gharbi, portant sur un titre foncier à Sousse.',
    'Dossier actuellement en attente ; une vérification du cadastre est requise avant la première audience du 25/06/2024.',
  ],
}

export default function AiSummaryPage() {
  const { cases: initialCases } = useAppData()
  const [caseId, setCaseId] = useState(String(initialCases[0]?.id ?? ''))
  const [shown, setShown] = useState(false)

  const summary = SUMMARIES[Number(caseId)] ?? [
    'Ce dossier ne contient pas encore assez d\'éléments pour générer un résumé détaillé.',
  ]

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
            <Btn onClick={() => setShown(true)}>✨ Résumer</Btn>
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
