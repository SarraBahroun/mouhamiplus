'use client'

import { use, useState } from 'react'
import { useRouter, notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { RoleBadge } from '@/components/members/RoleBadge'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'
import { updateMember } from '../../actions'

export default function MemberEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()
  const { members, loading, refresh } = useAppData()
  const member = members.find((m) => m.id === id)

  const [form, setForm] = useState({ firstName: member?.firstName ?? '', lastName: member?.lastName ?? '', phone: member?.phone ?? '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (loading) return null
  if (!member) notFound()

  const submit = async () => {
    setSaving(true)
    const result = await updateMember(member.id, form)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    await refresh()
    showToast('Membre mis à jour')
    router.push(`/members/${member.id}`)
  }

  return (
    <Card style={{ maxWidth: 500 }}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <RoleBadge role={member.role} size="md" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>
            Modifier {member.firstName} {member.lastName}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Prénom" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <Input label="Nom de famille" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
        </div>
        <Input label="Adresse e-mail" type="email" value={member.email} onChange={() => {}} disabled hint="L'e-mail de connexion ne se modifie pas ici." />
        <Input label="Téléphone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+216 XX XXX XXX" />

        {error && <p style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}>{error}</p>}

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit} disabled={saving}>{saving ? '…' : 'Enregistrer'}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push(`/members/${member.id}`)}>Annuler</Btn>
        </div>
      </div>
    </Card>
  )
}
