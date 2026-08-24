'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { Btn } from '@/components/ui/Btn'
import { REGISTER_CABINET_TEAM_COUNTS_KEY } from '../teamCountsKey'

export default function RegisterCabinetTeamPage() {
  const router = useRouter()
  const [lawyers, setLawyers] = useState(2)
  const [secretaries, setSecretaries] = useState(1)
  const [interns, setInterns] = useState(0)

  const submit = () => {
    sessionStorage.setItem(REGISTER_CABINET_TEAM_COUNTS_KEY, JSON.stringify({ lawyers, secretaries, interns }))
    router.push('/register/cabinet/invite')
  }

  return (
    <Card style={{ maxWidth: 480 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
            Composition de l&apos;équipe
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Étape 2 sur 3 — Combien de membres ?</p>
        </div>

        <Stepper label="Avocats" value={lawyers} onChange={setLawyers} hint="Collaborateurs et associés" />
        <Stepper label="Secrétaires" value={secretaries} onChange={setSecretaries} />
        <Stepper label="Stagiaires" value={interns} onChange={setInterns} hint="Accès limité, supervision obligatoire" />

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit}>Continuer</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register/cabinet')}>Retour</Btn>
        </div>
      </div>
    </Card>
  )
}
