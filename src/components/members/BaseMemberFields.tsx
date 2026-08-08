'use client'

import { Input } from '@/components/ui/Input'

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
  const f = (k: keyof MemberFormFields) => (v: string) => setForm({ ...form, [k]: v })
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Prénom" value={form.firstName} onChange={f('firstName')} />
        <Input label="Nom de famille" value={form.lastName} onChange={f('lastName')} />
      </div>
      <Input label="Adresse e-mail" type="email" value={form.email} onChange={f('email')} placeholder="membre@cabinet.tn" />
      <Input label="Téléphone" type="tel" value={form.phone} onChange={f('phone')} placeholder="+216 XX XXX XXX" />
    </>
  )
}
