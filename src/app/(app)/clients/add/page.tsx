'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { Btn } from '@/components/ui/Btn'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'
import { ClientType } from '@/lib/clients-data'

export default function ClientAddPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { addClient } = useAppData()
  const [form, setForm] = useState({ name: '', type: 'individual', email: '', phone: '', address: '', city: '' })
  const [loading, setLoading] = useState(false)
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async () => {
    setLoading(true)
    const id = await addClient({ ...form, type: form.type as ClientType })
    setLoading(false)
    if (!id) { showToast("Échec de la création du client"); return }
    showToast('Client ajouté avec succès')
    router.push(`/clients/${id}`)
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <Card>
        <div className="flex flex-col gap-5">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
              Nouveau client
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Créer une fiche client</p>
          </div>

          <SelectInput
            label="Type de client"
            value={form.type}
            onChange={f('type')}
            options={[{ value: 'individual', label: 'Particulier' }, { value: 'company', label: 'Entreprise' }]}
          />
          <Input label="Nom complet / Raison sociale" value={form.name} onChange={f('name')} placeholder="Ahmed Ben Salah" />
          <Input label="Adresse e-mail" type="email" value={form.email} onChange={f('email')} placeholder="client@email.tn" />
          <Input label="Téléphone" type="tel" value={form.phone} onChange={f('phone')} placeholder="+216 XX XXX XXX" />
          <Input label="Adresse" value={form.address} onChange={f('address')} placeholder="12 Rue de Marseille" />
          <Input label="Ville" value={form.city} onChange={f('city')} placeholder="Tunis" />

          <div className="flex flex-col gap-2">
            <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : 'Créer la fiche client'}</Btn>
            <Btn fullWidth variant="ghost" onClick={() => router.push('/clients')}>Annuler</Btn>
          </div>
        </div>
      </Card>
    </div>
  )
}
