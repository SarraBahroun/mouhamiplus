'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { Stepper } from '@/components/ui/Stepper'
import { Btn } from '@/components/ui/Btn'
import { InviteList, InviteRow } from '@/components/onboarding/InviteList'
import { sendInvites } from '@/lib/invite-rows'
import { useToast } from '@/providers/ToastProvider'
import { REGISTER_INDIVIDUAL_STORAGE_KEY } from '../storageKey'
import { registerIndividual } from '../actions'

export default function RegisterIndividualTeamPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [secretaryCount, setSecretaryCount] = useState(1)
  const [inviteNow, setInviteNow] = useState(true)
  const [rows, setRows] = useState<InviteRow[]>([{ id: 1, name: '', email: '', role: 'secretary' }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(REGISTER_INDIVIDUAL_STORAGE_KEY)) {
      router.replace('/register/individual')
    }
  }, [router])

  useEffect(() => {
    setRows((prev) => {
      if (secretaryCount === prev.length) return prev
      if (secretaryCount > prev.length) {
        const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) : 0
        const additions = Array.from({ length: secretaryCount - prev.length }, (_, i) => ({
          id: nextId + i + 1,
          name: '',
          email: '',
          role: 'secretary',
        }))
        return [...prev, ...additions]
      }
      return prev.slice(0, secretaryCount)
    })
  }, [secretaryCount])

  const submit = async () => {
    const raw = sessionStorage.getItem(REGISTER_INDIVIDUAL_STORAGE_KEY)
    if (!raw) {
      router.replace('/register/individual')
      return
    }
    const data = JSON.parse(raw)
    setError('')
    setLoading(true)
    const result = await registerIndividual({
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      barNumber: data.barNumber ?? '',
      barRegion: data.barRegion ?? '',
      password: data.password ?? '',
      firmName: data.firmName ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      firmPhone: data.firmPhone ?? '',
    })
    if (result.error) {
      setLoading(false)
      setError(result.error)
      return
    }
    sessionStorage.removeItem(REGISTER_INDIVIDUAL_STORAGE_KEY)

    if (inviteNow && rows.some((r) => r.name.trim() && r.email.trim())) {
      const { sent, failed } = await sendInvites(rows)
      if (failed.length) {
        showToast(`${sent} invitation(s) envoyée(s), ${failed.length} échec(s) : ${failed.join(', ')}`)
      } else if (sent) {
        showToast(`${sent} invitation(s) envoyée(s).`)
      }
    }

    setLoading(false)
    router.push('/register/plan')
  }

  return (
    <Card style={{ maxWidth: 480 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
            Votre équipe
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Étape 3 sur 3 — Secrétariat</p>
        </div>

        <Stepper
          label="Combien de secrétaires souhaitez-vous ajouter ?"
          value={secretaryCount}
          onChange={setSecretaryCount}
          hint="Vous pourrez en ajouter d'autres plus tard"
        />

        <Divider text="INVITATION" />

        <div className="flex gap-2" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius)', padding: 3, border: '1px solid var(--color-border)' }}>
          {[{ id: true, label: 'Inviter maintenant' }, { id: false, label: 'Plus tard' }].map((opt) => (
            <button
              key={String(opt.id)}
              onClick={() => setInviteNow(opt.id)}
              style={{
                flex: 1,
                padding: '8px 10px',
                fontSize: 13,
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
                background: inviteNow === opt.id ? 'var(--color-card)' : 'transparent',
                color: inviteNow === opt.id ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                fontWeight: inviteNow === opt.id ? 600 : 400,
                boxShadow: inviteNow === opt.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {inviteNow && (
          <InviteList
            rows={rows}
            setRows={setRows}
            roleOptions={[{ value: 'secretary', label: 'Secrétaire' }]}
            addLabel="+ Ajouter une secrétaire"
          />
        )}

        {error && (
          <p style={{ fontSize: 13, color: 'var(--color-destructive, #dc2626)', margin: 0 }}>{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : 'Créer mon compte'}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register/individual/firm')}>Retour</Btn>
        </div>
      </div>
    </Card>
  )
}
