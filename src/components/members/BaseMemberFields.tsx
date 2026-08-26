'use client'

import { Input } from '@/components/ui/Input'
import { useLang } from '@/providers/LangProvider'

export interface MemberFormFields {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export function BaseMemberFields({
  form,
  setForm,
}: {
  form: MemberFormFields
  setForm: (f: MemberFormFields) => void
}) {
  const { tr } = useLang()
  const f = (k: keyof MemberFormFields) => (v: string) => setForm({ ...form, [k]: v })
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label={tr.member_first_name} value={form.firstName} onChange={f('firstName')} />
        <Input label={tr.member_last_name} value={form.lastName} onChange={f('lastName')} />
      </div>
      <Input label={tr.common_email} type="email" value={form.email} onChange={f('email')} placeholder={tr.member_email_placeholder} />
      <Input label={tr.common_phone} type="tel" value={form.phone} onChange={f('phone')} placeholder={tr.member_phone_placeholder} />
    </>
  )
}
