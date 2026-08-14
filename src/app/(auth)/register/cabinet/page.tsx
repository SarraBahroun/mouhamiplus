'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { SearchSelect } from '@/components/ui/SearchSelect'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { TUNISIA_CITIES } from '@/lib/tunisia-cities'
import { isValidTunisianPhone, isValidTunisianTaxId } from '@/lib/validation'
import { registerCabinet } from './actions'

const CITY_OPTIONS = TUNISIA_CITIES.map((c) => ({ value: c, label: c }))

export default function RegisterCabinetPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [form, setForm] = useState({
    cabinetName: '', taxId: '', city: '', size: '', adminFirst: '', adminLast: '', email: '', phone: '', password: ''
  })
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))
  const [error, setError] = useState('')
  const [taxIdError, setTaxIdError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.cabinetName || !form.adminFirst || !form.adminLast || !form.email || !form.password) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }
    if (form.taxId && !isValidTunisianTaxId(form.taxId)) {
      setTaxIdError('Format invalide. Le matricule fiscal doit suivre le format tunisien, ex. 0123456/A/P/000.')
      return
    }
    setTaxIdError('')
    if (form.phone && !isValidTunisianPhone(form.phone)) {
      setPhoneError('Numéro de téléphone invalide (format tunisien attendu, ex. +216 XX XXX XXX).')
      return
    }
    setPhoneError('')
    setError('')
    setLoading(true)
    const result = await registerCabinet(form)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push('/register/cabinet/team')
  }

  const sizes = [
    { value: '', label: "— Taille de l'équipe —" },
    { value: '1-2', label: '1–2 avocats' },
    { value: '3-10', label: '3–10 avocats' },
    { value: '11-30', label: '11–30 avocats' },
    { value: '31+', label: '31+ avocats' },
  ]

  return (
    <Card style={{ maxWidth: 480 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
            {tr.reg_cab_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Étape 1 sur 3 — Cabinet & administrateur</p>
        </div>

        <Divider text="CABINET" />

        <Input label={tr.cabinet_name} value={form.cabinetName} onChange={f('cabinetName')} placeholder="Cabinet Trabelsi & Associés" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={tr.cabinet_id}
            value={form.taxId}
            onChange={f('taxId')}
            placeholder="0123456/A/P/000"
            error={taxIdError}
          />
          <SearchSelect label={tr.cabinet_city} value={form.city} onChange={f('city')} options={CITY_OPTIONS} placeholder="Rechercher une ville" />
        </div>

        <SelectInput label={tr.cabinet_size} value={form.size} onChange={f('size')} options={sizes} />

        <Divider text="ADMINISTRATEUR" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label={tr.first_name} value={form.adminFirst} onChange={f('adminFirst')} />
          <Input label={tr.last_name} value={form.adminLast} onChange={f('adminLast')} />
        </div>

        <Input label={tr.email} type="email" value={form.email} onChange={f('email')} />
        <Input
          label={tr.phone}
          type="tel"
          value={form.phone}
          onChange={f('phone')}
          placeholder="+216 XX XXX XXX"
          hint={phoneError ? undefined : 'Pour la vérification 2FA'}
          error={phoneError}
        />
        <Input label={tr.password} type="password" value={form.password} onChange={f('password')} error={error} />

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : tr.continue}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register')}>{tr.back}</Btn>
        </div>
      </div>
    </Card>
  )
}
