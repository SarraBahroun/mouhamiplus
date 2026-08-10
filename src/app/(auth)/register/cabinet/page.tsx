'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { registerCabinet } from './actions'

export default function RegisterCabinetPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [form, setForm] = useState({
    cabinetName: '', taxId: '', city: '', size: '', adminFirst: '', adminLast: '', email: '', phone: '', password: ''
  })
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.cabinetName || !form.adminFirst || !form.adminLast || !form.email || !form.password) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }
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
          <Input label={tr.cabinet_id} value={form.taxId} onChange={f('taxId')} placeholder="0123456/A/P/000" />
          <Input label={tr.cabinet_city} value={form.city} onChange={f('city')} placeholder="Tunis" />
        </div>

        <SelectInput label={tr.cabinet_size} value={form.size} onChange={f('size')} options={sizes} />

        <Divider text="ADMINISTRATEUR" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label={tr.first_name} value={form.adminFirst} onChange={f('adminFirst')} />
          <Input label={tr.last_name} value={form.adminLast} onChange={f('adminLast')} />
        </div>

        <Input label={tr.email} type="email" value={form.email} onChange={f('email')} />
        <Input label={tr.phone} type="tel" value={form.phone} onChange={f('phone')} hint="Pour la vérification 2FA" />
        <Input label={tr.password} type="password" value={form.password} onChange={f('password')} error={error} />

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : tr.continue}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register')}>{tr.back}</Btn>
        </div>
      </div>
    </Card>
  )
}
