'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'

export default function ResetNewPassPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')

  const strength = pass.length === 0 ? 0 : pass.length < 8 ? 1 : pass.length < 12 ? 2 : 3
  const strengthColors = ['transparent', '#C0392B', '#E67E22', '#27AE60']
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort']

  return (
    <Card style={{ maxWidth: 400 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
            {tr.new_pass_title}
          </h1>
        </div>
        <div className="flex flex-col gap-3">
          <Input label={tr.new_pass} type="password" value={pass} onChange={setPass} />
          {pass && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background: strength >= level ? strengthColors[strength] : 'var(--color-border)',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 11, color: strengthColors[strength], fontFamily: 'var(--font-mono)' }}>
                {strengthLabels[strength]}
              </span>
            </div>
          )}
        </div>
        <Input
          label={tr.confirm_pass}
          type="password"
          value={confirm}
          onChange={setConfirm}
          error={confirm && confirm !== pass ? 'Les mots de passe ne correspondent pas' : ''}
        />
        <Btn fullWidth disabled={!pass || pass !== confirm} onClick={() => router.push('/login')}>
          {tr.save_pass}
        </Btn>
      </div>
    </Card>
  )
}
