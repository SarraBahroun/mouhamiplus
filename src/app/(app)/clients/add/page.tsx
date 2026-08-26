'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SelectInput } from '@/components/ui/SelectInput'
import { Btn } from '@/components/ui/Btn'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'
import { useLang } from '@/providers/LangProvider'
import { ClientType } from '@/lib/clients-data'
import { inviteClient } from '../actions'

export default function ClientAddPage() {
  const router = useRouter()
  const { tr } = useLang()
  const { showToast } = useToast()
  const { addClient, refresh } = useAppData()
  const [form, setForm] = useState({ name: '', type: 'individual', email: '', phone: '', address: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})
  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async () => {
    const nextErrors: typeof errors = {}
    if (!form.name.trim()) nextErrors.name = tr.clients_add_error_name_required
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    const id = await addClient({ ...form, type: form.type as ClientType })
    if (!id) {
      setLoading(false)
      showToast(tr.clients_add_toast_create_failed)
      return
    }

    const invite = await inviteClient(id)
    if ('error' in invite) {
      showToast(tr.clients_add_toast_partial_fail.replace('{error}', invite.error))
    } else {
      await refresh()
      sessionStorage.setItem(
        `mouhamiplus-client-access-${id}`,
        JSON.stringify({ login: invite.loginId ?? form.email, tempPassword: invite.tempPassword, emailed: invite.emailed })
      )
      showToast(invite.emailed ? tr.clients_add_toast_success_emailed : tr.clients_add_toast_success_generated)
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
              {tr.clients_add_title}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.clients_add_subtitle}</p>
          </div>

          <SelectInput
            label={tr.clients_add_type_label}
            value={form.type}
            onChange={f('type')}
            options={[{ value: 'individual', label: tr.clients_type_individual }, { value: 'company', label: tr.clients_type_company }]}
          />
          <Input label={tr.clients_add_name_label} value={form.name} onChange={f('name')} placeholder={tr.clients_add_name_placeholder} error={errors.name} />
          <Input
            label={tr.clients_add_email_label}
            type="email"
            value={form.email}
            onChange={f('email')}
            placeholder={tr.clients_add_email_placeholder}
            hint={tr.clients_add_email_hint}
          />
          <Input label={tr.common_phone} type="tel" value={form.phone} onChange={f('phone')} placeholder={tr.clients_add_phone_placeholder} />
          <Input label={tr.common_address} value={form.address} onChange={f('address')} placeholder={tr.clients_add_address_placeholder} />
          <Input label={tr.common_city} value={form.city} onChange={f('city')} placeholder={tr.clients_add_city_placeholder} />

          <div className="flex flex-col gap-2">
            <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : tr.clients_add_submit_button}</Btn>
            <Btn fullWidth variant="ghost" onClick={() => router.push('/clients')}>{tr.common_cancel}</Btn>
          </div>
        </div>
      </Card>
    </div>
  )
}
