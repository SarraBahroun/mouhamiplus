'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { SearchSelect } from '@/components/ui/SearchSelect'
import { Btn } from '@/components/ui/Btn'
import { SPECIALITIES } from '@/lib/members-data'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'

export default function CaseAddPage() {
  const router = useRouter()
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
    if (!id) { showToast('Échec de la création du dossier'); return }
    showToast('Dossier créé avec succès')
    router.push(`/cases/${id}`)
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <Card>
        <div className="flex flex-col gap-5">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
              Nouveau dossier
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Ouvrir un dossier client</p>
          </div>

          <Input label="Intitulé du dossier" value={form.title} onChange={f('title')} placeholder="Affaire X c/ Y" />
          <SearchSelect
            label="Client"
            value={form.clientId}
            onChange={f('clientId')}
            options={clients.map((c) => ({ value: String(c.id), label: c.name }))}
            placeholder="Rechercher un client"
          />
          <SearchSelect
            label="Domaine juridique"
            value={form.practiceArea}
            onChange={f('practiceArea')}
            options={SPECIALITIES.map((s) => ({ value: s, label: s }))}
            placeholder="Rechercher un domaine"
          />
          <SelectInput
            label="Avocat assigné"
            value={form.assignedTo}
            onChange={f('assignedTo')}
            options={[{ value: '', label: '— Sélectionner un avocat —' }, ...lawyers.map((m) => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))]}
          />

          <div className="flex flex-col gap-2">
            <Btn fullWidth onClick={submit} disabled={loading || !form.title || !form.clientId || !form.practiceArea || !form.assignedTo}>{loading ? '…' : 'Créer le dossier'}</Btn>
            <Btn fullWidth variant="ghost" onClick={() => router.push('/cases')}>Annuler</Btn>
          </div>
        </div>
      </Card>
    </div>
  )
}
