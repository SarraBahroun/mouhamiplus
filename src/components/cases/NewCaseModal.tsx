'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { SearchSelect } from '@/components/ui/SearchSelect'
import { SPECIALITIES } from '@/lib/members-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useLang } from '@/providers/LangProvider'
import { useToast } from '@/providers/ToastProvider'

interface NewCaseModalProps {
  onCreated: (caseId: string) => void
  onClose: () => void
}

// Création rapide d'un dossier sans quitter la page courante (ex. depuis le Scanner
// OCR, quand le dossier cible n'existe pas encore). Mêmes champs obligatoires que
// /cases/add — c'est le même addCase() derrière.
export function NewCaseModal({ onCreated, onClose }: NewCaseModalProps) {
  const { tr, rtl } = useLang()
  const { showToast } = useToast()
  const { clients, members, addCase } = useAppData()
  const [form, setForm] = useState({ title: '', clientId: '', practiceArea: '', assignedTo: '' })
  const [loading, setLoading] = useState(false)
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))
  const lawyers = members.filter((m) => m.role === 'owner' || m.role === 'collaborator')

  const submit = async () => {
    setLoading(true)
    const id = await addCase({ title: form.title, clientId: form.clientId, practiceArea: form.practiceArea, assignedTo: form.assignedTo })
    setLoading(false)
    if (!id) {
      showToast(tr.case_create_failure)
      return
    }
    showToast(tr.case_create_success)
    onCreated(id)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18,21,28,0.45)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        dir={rtl ? 'rtl' : 'ltr'}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '22px 24px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex flex-col gap-5">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>
              {tr.case_create_title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.case_create_subtitle}</p>
          </div>

          <Input label={tr.case_create_label_title} value={form.title} onChange={f('title')} placeholder={tr.case_create_placeholder_title} rtl={rtl} />
          <SearchSelect
            label={tr.case_create_label_client}
            value={form.clientId}
            onChange={f('clientId')}
            options={clients.map((c) => ({ value: String(c.id), label: c.name }))}
            placeholder={tr.case_create_placeholder_client}
            rtl={rtl}
          />
          <SearchSelect
            label={tr.case_create_label_practice_area}
            value={form.practiceArea}
            onChange={f('practiceArea')}
            options={SPECIALITIES.map((s) => ({ value: s, label: s }))}
            placeholder={tr.case_create_placeholder_practice_area}
            rtl={rtl}
          />
          <SelectInput
            label={tr.case_create_label_assigned}
            value={form.assignedTo}
            onChange={f('assignedTo')}
            options={[{ value: '', label: tr.case_create_placeholder_assigned }, ...lawyers.map((m) => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))]}
            rtl={rtl}
          />

          <div className="flex flex-col gap-2">
            <Btn fullWidth onClick={submit} disabled={loading || !form.title || !form.clientId || !form.practiceArea || !form.assignedTo}>
              {loading ? tr.case_create_creating : tr.case_create_submit}
            </Btn>
            <Btn fullWidth variant="ghost" onClick={onClose}>
              {tr.case_create_cancel}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
