'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { Btn } from '@/components/ui/Btn'
import { RoleBadge } from '@/components/members/RoleBadge'
import { BaseMemberFields, MemberFormFields } from '@/components/members/BaseMemberFields'
import { SPECIALITIES } from '@/lib/members-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useToast } from '@/providers/ToastProvider'

export default function MembersFormAssociatePage() {
  const router = useRouter()
  const { addMember } = useAppData()
  const { showToast } = useToast()
  const [form, setForm] = useState<MemberFormFields>({ firstName: '', lastName: '', email: '', phone: '' })
  const [specs, setSpecs] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toggleSpec = (s: string) => setSpecs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const submit = async () => {
    setLoading(true)
    const result = await addMember({ ...form, role: 'owner' })
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    sessionStorage.setItem(`mouhamiplus-member-access-${result.id}`, JSON.stringify({ tempPassword: result.tempPassword }))
    showToast(result.emailed ? 'Compte créé — identifiants envoyés par e-mail' : 'Compte créé — mot de passe temporaire disponible sur la fiche du membre')
    router.push(`/members/${result.id}/permissions`)
  }

  return (
    <Card style={{ maxWidth: 500 }}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <RoleBadge role="owner" size="md" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>
            Création avocat associé
          </h1>
        </div>

        <BaseMemberFields form={form} setForm={setForm} />

        <Divider text="SPÉCIALITÉS" />

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)' }}>Domaines de spécialité</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALITIES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpec(s)}
                style={{
                  padding: '5px 11px',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  border: `1.5px solid ${specs.includes(s) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 20,
                  background: specs.includes(s) ? 'rgba(22, 35, 63,0.06)' : 'var(--color-card)',
                  color: specs.includes(s) ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}>{error}</p>}

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : 'Créer le compte'}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/members/add')}>Retour</Btn>
        </div>
      </div>
    </Card>
  )
}
