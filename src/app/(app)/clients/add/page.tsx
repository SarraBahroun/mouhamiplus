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
import { inviteClient } from '../actions'

export default function ClientAddPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { addClient, refresh } = useAppData()
  const [form, setForm] = useState({ name: '', type: 'individual', email: '', phone: '', address: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async () => {
    const nextErrors: typeof errors = {}
    if (!form.name.trim()) nextErrors.name = 'Le nom est obligatoire.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    const id = await addClient({ ...form, type: form.type as ClientType })
    if (!id) {
      setLoading(false)
      showToast("Échec de la création du client")
      return
    }

    const invite = await inviteClient(id)
    if ('error' in invite) {
      showToast(`Client ajouté, mais l'accès n'a pas pu être créé : ${invite.error}`)
    } else {
      await refresh()
      sessionStorage.setItem(
        `mouhamiplus-client-access-${id}`,
        JSON.stringify({ login: invite.loginId ?? form.email, tempPassword: invite.tempPassword, emailed: invite.emailed })
      )
      showToast(invite.emailed ? 'Client ajouté — identifiants envoyés par email (voir aussi la fiche)' : 'Client ajouté — identifiants générés (voir la fiche)')
    }
    setLoading(false)
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
          <Input label="Nom complet / Raison sociale" value={form.name} onChange={f('name')} placeholder="Ahmed Ben Salah" error={errors.name} />
          <Input
            label="Adresse e-mail (optionnel)"
            type="email"
            value={form.email}
            onChange={f('email')}
            placeholder="client@email.tn"
            hint="Si laissée vide, un identifiant de connexion sera généré automatiquement — à transmettre au client avec le mot de passe."
          />
          <Input label="Téléphone" type="tel" value={form.phone} onChange={f('phone')} placeholder="+216 XX XXX XXX" />
          <Input label="Adresse" value={form.address} onChange={f('address')} placeholder="12 Rue de Marseille" />
          <Input label="Ville" value={form.city} onChange={f('city')} placeholder="Tunis" />

          <div className="flex flex-col gap-2">
            <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : 'Créer la fiche client et son accès'}</Btn>
            <Btn fullWidth variant="ghost" onClick={() => router.push('/clients')}>Annuler</Btn>
          </div>
        </div>
      </Card>
    </div>
  )
}
