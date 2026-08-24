'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { useToast } from '@/providers/ToastProvider'
import { createClient } from '@/lib/supabase/client'

interface DeadlineRule {
  id: string
  recourse_type: string
  cpcc_reference: string | null
  trigger_event: string
  days: number | null
  verified: boolean
  note: string | null
}

export default function DeadlineRulesPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [rules, setRules] = useState<DeadlineRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('legal_deadline_rules')
      .select('*')
      .order('recourse_type')
      .then(({ data }) => {
        setRules((data as DeadlineRule[]) ?? [])
        setLoading(false)
      })
  }, [])

  const save = async (rule: DeadlineRule) => {
    const raw = drafts[rule.id] ?? (rule.days?.toString() ?? '')
    const days = raw.trim() === '' ? null : Number(raw)
    if (raw.trim() !== '' && (!Number.isInteger(days) || (days as number) <= 0)) {
      showToast('Le délai doit être un nombre de jours entier positif.')
      return
    }
    setSaving(rule.id)
    const supabase = createClient()
    // .select() nécessaire pour détecter un blocage RLS silencieux : sans lui, un update
    // refusé par accessSettings (migration 0013) renvoie quand même 0 erreur.
    const { data, error } = await supabase
      .from('legal_deadline_rules')
      .update({ days, verified: days !== null, updated_at: new Date().toISOString() })
      .eq('id', rule.id)
      .select('id')
    setSaving(null)
    if (error || !data || data.length === 0) {
      showToast("Impossible d'enregistrer (vérifiez vos permissions).")
      return
    }
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, days, verified: days !== null } : r)))
    showToast('Délai enregistré')
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
            Délais légaux (Tunisie)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Référentiel des délais de recours du Code de procédure civile et commerciale (CPCC).
          </p>
        </div>

        <div style={{ padding: '12px 16px', background: 'rgba(230,81,0,0.06)', border: '1px solid rgba(230,81,0,0.25)', borderRadius: 6 }}>
          <p style={{ fontSize: 13, color: 'var(--color-foreground)', margin: 0 }}>
            ⚠️ Ces délais ne sont <strong>pas pré-remplis</strong> — vérifiez chaque valeur sur le texte officiel du CPCC
            (<a href="https://www.jurisitetunisie.com/tunisie/codes/cpcc/menu.html" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>jurisitetunisie.com</a>)
            avant de la renseigner. Un délai non vérifié n&apos;est utilisé nulle part ailleurs dans l&apos;application.
          </p>
        </div>

        {loading && <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Chargement…</p>}

        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <div key={rule.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '16px 18px' }}>
              <div className="flex items-start justify-between gap-3" style={{ marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-foreground)' }}>{rule.recourse_type}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {rule.cpcc_reference}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '2px 8px', borderRadius: 3,
                    background: rule.verified ? 'rgba(46,125,50,0.08)' : 'rgba(230,81,0,0.1)',
                    color: rule.verified ? '#2E7D32' : '#E65100',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rule.verified ? 'VÉRIFIÉ' : 'NON VÉRIFIÉ'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: '0 0 10px' }}>
                Point de départ : {rule.trigger_event}
                {rule.note ? ` — ${rule.note}` : ''}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={drafts[rule.id] ?? (rule.days?.toString() ?? '')}
                  onChange={(e) => setDrafts((p) => ({ ...p, [rule.id]: e.target.value }))}
                  placeholder="Nombre de jours"
                  style={{ width: 140, padding: '7px 10px', fontSize: 13, border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'var(--color-background)', color: 'var(--color-foreground)', outline: 'none' }}
                />
                <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>jours</span>
                <Btn variant="secondary" onClick={() => save(rule)} disabled={saving === rule.id}>
                  {saving === rule.id ? '…' : 'Enregistrer'}
                </Btn>
              </div>
            </div>
          ))}
          {!loading && rules.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Aucune règle de délai définie.</p>
          )}
        </div>

        <Btn fullWidth variant="ghost" onClick={() => router.push('/settings')}>← Retour aux paramètres</Btn>
      </div>
    </div>
  )
}
