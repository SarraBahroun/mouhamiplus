'use client'

import { Btn } from '@/components/ui/Btn'

const recentScans = [
  { name: 'Assignation_scan_001.pdf', case: 'Affaire Bensalem c/ Société TechTun', date: '2024-06-12 09:14', excerpt: 'Le Tribunal de première instance de Tunis, statuant en matière civile, saisi par requête introductive d\'instance…' },
  { name: 'Titre_foncier_scan.pdf', case: 'Litige immobilier Gharbi', date: '2024-06-10 15:42', excerpt: 'Extrait du registre foncier n° 45213 — Propriété sise à Sousse, superficie de 340 m²…' },
  { name: 'Contrat_signe_scan.pdf', case: 'Contrat commercial Saïd & Associés', date: '2024-06-08 11:03', excerpt: 'Entre les soussignés, la société Saïd & Associés SARL, ci-après dénommée "le Client"…' },
]

export default function OcrPage() {
  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Scanner OCR</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Numérisez et extrayez le texte de vos documents papier
          </p>
        </div>

        <div
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 8,
            padding: '40px 20px',
            textAlign: 'center',
            background: 'var(--color-card)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', margin: '0 0 4px' }}>
            Glissez-déposez un fichier ou une photo ici
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: '0 0 16px' }}>
            PDF, JPG, PNG — jusqu&apos;à 20 Mo
          </p>
          <Btn>Choisir un fichier</Btn>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 10px' }}>
            Numérisations récentes
          </h2>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
            {recentScans.map((s, i) => (
              <div key={s.name} style={{ padding: '13px 16px', borderBottom: i < recentScans.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{s.name}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{s.date}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginBottom: 6 }}>{s.case}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-foreground)',
                    background: 'var(--color-secondary)',
                    borderRadius: 4,
                    padding: '8px 10px',
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{s.excerpt}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
