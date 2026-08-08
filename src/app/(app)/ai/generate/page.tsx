'use client'

import { useState } from 'react'
import { SelectInput } from '@/components/ui/SelectInput'
import { Btn } from '@/components/ui/Btn'
import { useAppData } from '@/providers/AppDataProvider'

const TEMPLATES = [
  { value: 'mise-en-demeure', label: 'Mise en demeure' },
  { value: 'assignation', label: 'Assignation' },
  { value: 'conclusions', label: 'Conclusions' },
  { value: 'contrat-honoraires', label: "Convention d'honoraires" },
]

const SAMPLE_OUTPUT = `Maître,

Par la présente, nous vous mettons en demeure de bien vouloir procéder, dans un délai de quinze (15) jours à compter de la réception des présentes, au règlement de la somme due au titre du dossier référencé ci-dessus.

À défaut de règlement dans le délai imparti, nous nous verrons contraints d'engager toute voie de droit utile à la sauvegarde des intérêts de notre client, sans autre avis ni sommation.

Veuillez agréer, Maître, l'expression de nos salutations distinguées.`

export default function AiGeneratePage() {
  const { cases: initialCases } = useAppData()
  const [template, setTemplate] = useState('mise-en-demeure')
  const [caseId, setCaseId] = useState(String(initialCases[0]?.id ?? ''))
  const [generated, setGenerated] = useState(false)

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
            Génération de documents par IA
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Générez un document juridique à partir d&apos;un modèle et des données du dossier
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <div className="flex flex-col gap-4">
              <SelectInput label="Modèle de document" value={template} onChange={setTemplate} options={TEMPLATES} />
              <SelectInput
                label="Dossier associé"
                value={caseId}
                onChange={setCaseId}
                options={initialCases.map((c) => ({ value: String(c.id), label: c.title }))}
              />
              <Btn fullWidth onClick={() => setGenerated(true)}>✨ Générer le document</Btn>
            </div>
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: 'var(--color-muted-foreground)' }}>
              APERÇU
            </h2>
            {generated ? (
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-foreground)', whiteSpace: 'pre-wrap' }}>{SAMPLE_OUTPUT}</p>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>
                Le document généré apparaîtra ici.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
