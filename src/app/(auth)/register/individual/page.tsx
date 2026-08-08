'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { REGISTER_INDIVIDUAL_STORAGE_KEY } from './storageKey'

export default function RegisterIndividualPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', barNumber: '', barRegion: '', password: '', confirm: ''
  })
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))
  const [error, setError] = useState('')

  const submit = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }
    if (form.confirm !== form.password) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setError('')
    sessionStorage.setItem(REGISTER_INDIVIDUAL_STORAGE_KEY, JSON.stringify(form))
    router.push('/register/individual/firm')
  }

  const regions = [
    { value: '', label: '— Choisir un barreau —' },
    { value: 'tunis', label: 'Tunis' },
    { value: 'sfax', label: 'Sfax' },
    { value: 'sousse', label: 'Sousse' },
    { value: 'monastir', label: 'Monastir' },
    { value: 'bizerte', label: 'Bizerte' },
    { value: 'nabeul', label: 'Nabeul' },
    { value: 'gabes', label: 'Gabès' },
  ]

  return (
    <Card style={{ maxWidth: 480 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
            {tr.reg_ind_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Étape 1 sur 3 — Informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label={tr.first_name} value={form.firstName} onChange={f('firstName')} />
          <Input label={tr.last_name} value={form.lastName} onChange={f('lastName')} />
        </div>

        <Input label={tr.email} type="email" value={form.email} onChange={f('email')} placeholder="nom@barreau.tn" />
        <Input label={tr.phone} type="tel" value={form.phone} onChange={f('phone')} placeholder="+216 XX XXX XXX" hint="Utilisé pour la vérification 2FA" />

        <Divider text="BARREAU" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label={tr.bar_number} value={form.barNumber} onChange={f('barNumber')} placeholder="TN-2019-0481" />
          <SelectInput label={tr.bar_region} value={form.barRegion} onChange={f('barRegion')} options={regions} />
        </div>

        <Divider text="SÉCURITÉ" />

        <Input label={tr.password} type="password" value={form.password} onChange={f('password')} />
        <Input label={tr.confirm_pass} type="password" value={form.confirm} onChange={f('confirm')} error={error || (form.confirm && form.confirm !== form.password ? 'Les mots de passe ne correspondent pas' : '')} />

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit}>{tr.continue}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register')}>{tr.back}</Btn>
        </div>
      </div>
    </Card>
  )
}
