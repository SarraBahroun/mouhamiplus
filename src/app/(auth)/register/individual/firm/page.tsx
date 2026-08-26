'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SearchSelect } from '@/components/ui/SearchSelect'
import { Btn } from '@/components/ui/Btn'
import { TUNISIA_CITIES } from '@/lib/tunisia-cities'
import { isValidTunisianPhone } from '@/lib/validation'
import { useLang } from '@/providers/LangProvider'
import { REGISTER_INDIVIDUAL_STORAGE_KEY } from '../storageKey'

const CITY_OPTIONS = TUNISIA_CITIES.map((c) => ({ value: c, label: c }))

export default function RegisterIndividualFirmPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [form, setForm] = useState({ firmName: '', address: '', city: '', firmPhone: '' })
  const [phoneError, setPhoneError] = useState('')
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTER_INDIVIDUAL_STORAGE_KEY)
    if (!raw) {
      router.replace('/register/individual')
    }
  }, [router])

  const submit = () => {
    if (form.firmPhone && !isValidTunisianPhone(form.firmPhone)) {
      setPhoneError(tr.phone_invalid_error)
      return
    }
    setPhoneError('')
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
            {tr.firm_page_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.firm_step_caption}</p>
        </div>

        <Input label={tr.cabinet_name} value={form.firmName} onChange={f('firmName')} placeholder={tr.firm_name_placeholder} hint={tr.firm_name_hint} />
        <Input label={tr.common_address} value={form.address} onChange={f('address')} placeholder={tr.address_placeholder} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchSelect label={tr.common_city} value={form.city} onChange={f('city')} options={CITY_OPTIONS} placeholder={tr.city_search_placeholder} />
          <Input
            label={tr.firm_phone_label}
            type="tel"
            value={form.firmPhone}
            onChange={f('firmPhone')}
            placeholder="+216 XX XXX XXX"
            hint={phoneError ? undefined : tr.optional}
            error={phoneError}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit}>{tr.continue}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register/individual')}>{tr.back}</Btn>
        </div>
      </div>
    </Card>
  )
}
