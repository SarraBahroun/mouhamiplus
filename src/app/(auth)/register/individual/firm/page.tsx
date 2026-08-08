'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { REGISTER_INDIVIDUAL_STORAGE_KEY } from '../storageKey'

export default function RegisterIndividualFirmPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firmName: '', address: '', city: '', firmPhone: '' })
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTER_INDIVIDUAL_STORAGE_KEY)
    if (!raw) {
      router.replace('/register/individual')
    }
  }, [router])

  const submit = () => {
    const raw = sessionStorage.getItem(REGISTER_INDIVIDUAL_STORAGE_KEY)
    if (!raw) {
      router.replace('/register/individual')
      return
    }
    const prev = JSON.parse(raw)
    sessionStorage.setItem(REGISTER_INDIVIDUAL_STORAGE_KEY, JSON.stringify({ ...prev, ...form }))
    router.push('/register/individual/team')
  }

  return (
    <Card style={{ maxWidth: 480 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
            Informations du cabinet
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Étape 2 sur 3 — Votre pratique</p>
        </div>

        <Input label="Nom du cabinet" value={form.firmName} onChange={f('firmName')} placeholder="Cabinet Me. Trabelsi" hint="Ou votre nom si vous exercez sans enseigne" />
        <Input label="Adresse" value={form.address} onChange={f('address')} placeholder="12 Avenue Habib Bourguiba" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Ville" value={form.city} onChange={f('city')} placeholder="Tunis" />
          <Input label="Téléphone du cabinet" type="tel" value={form.firmPhone} onChange={f('firmPhone')} placeholder="+216 XX XXX XXX" hint="optionnel" />
        </div>

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit}>Continuer</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register/individual')}>Retour</Btn>
        </div>
      </div>
    </Card>
  )
}
