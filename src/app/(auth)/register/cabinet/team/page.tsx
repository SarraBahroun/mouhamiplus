'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'
import { REGISTER_CABINET_TEAM_COUNTS_KEY } from '../teamCountsKey'

export default function RegisterCabinetTeamPage() {
  const router = useRouter()
  const { tr } = useLang()
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
            {tr.cabteam_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.cabteam_step_caption}</p>
        </div>

        <Stepper label={tr.lawyers_label} value={lawyers} onChange={setLawyers} hint={tr.lawyers_hint} />
        <Stepper label={tr.secretaries_label} value={secretaries} onChange={setSecretaries} />
        <Stepper label={tr.interns_label} value={interns} onChange={setInterns} hint={tr.interns_hint} />

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit}>{tr.continue}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register/cabinet')}>{tr.back}</Btn>
        </div>
      </div>
    </Card>
  )
}
