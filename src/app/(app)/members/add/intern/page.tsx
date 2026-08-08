'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { SelectInput } from '@/components/ui/SelectInput'
import { RoleBadge } from '@/components/members/RoleBadge'
import { BaseMemberFields, MemberFormFields } from '@/components/members/BaseMemberFields'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'

export default function MembersFormInternPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { addMember, members } = useAppData()
  const [form, setForm] = useState<MemberFormFields>({ firstName: '', lastName: '', email: '', phone: '' })
  const [supervisorId, setSupervisorId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supervisors = members.filter((m) => m.role === 'owner' || m.role === 'collaborator')

  const submit = async () => {
    setLoading(true)
    const result = await addMember({ ...form, role: 'intern', supervisorId })
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    showToast(`Compte créé — mot de passe temporaire : ${result.tempPassword}`)
    router.push('/members')
  }

  return (
    <Card style={{ maxWidth: 500 }}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <RoleBadge role="intern" size="md" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>
            Création stagiaire
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: 'rgba(230,81,0,0.06)',
            border: '1px solid rgba(230,81,0,0.2)',
            borderRadius: 'var(--radius)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#E65100" style={{ flexShrink: 0 }}>
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a1 1 0 110 2 1 1 0 010-2zm-1 4h2v4H7V8z" />
          </svg>
          <span style={{ fontSize: 12, color: '#E65100', fontWeight: 500 }}>
            Supervision requise — un avocat responsable doit être désigné.
          </span>
        </div>

        <BaseMemberFields form={form} setForm={setForm} />

        <SelectInput
          label="Avocat superviseur *"
          value={supervisorId}
          onChange={setSupervisorId}
          options={[
            { value: '', label: '— Sélectionner un superviseur —' },
            ...supervisors.map((m) => ({ value: m.id, label: `${m.firstName} ${m.lastName}` })),
          ]}
        />

        {error && <p style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}>{error}</p>}

        <div className="flex flex-col gap-2">
          <Btn fullWidth disabled={!supervisorId || loading} onClick={submit}>
            {loading ? '…' : 'Créer le compte stagiaire'}
          </Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/members/add')}>Retour</Btn>
        </div>
      </div>
    </Card>
  )
}
