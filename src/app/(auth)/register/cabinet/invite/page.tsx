'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { InviteList, InviteRow } from '@/components/onboarding/InviteList'
import { sendInvites } from '@/lib/invite-rows'
import { useToast } from '@/providers/ToastProvider'
import { useLang } from '@/providers/LangProvider'
import { REGISTER_CABINET_TEAM_COUNTS_KEY, RegisterCabinetTeamCounts } from '../teamCountsKey'

const DEFAULT_ROWS: InviteRow[] = [{ id: 1, name: '', email: '', role: 'collaborator' }]

function rowsFromTeamCounts(counts: RegisterCabinetTeamCounts): InviteRow[] {
  let id = 1
  const rows: InviteRow[] = []
  for (let i = 0; i < counts.lawyers; i++) rows.push({ id: id++, name: '', email: '', role: 'collaborator' })
  for (let i = 0; i < counts.secretaries; i++) rows.push({ id: id++, name: '', email: '', role: 'secretary' })
  for (let i = 0; i < counts.interns; i++) rows.push({ id: id++, name: '', email: '', role: 'intern', supervisorRowId: '' })
  return rows.length ? rows : DEFAULT_ROWS
}

export default function RegisterCabinetInvitePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { tr } = useLang()
  const ROLE_OPTIONS = [
    { value: 'owner', label: tr.role_owner },
    { value: 'collaborator', label: tr.role_collaborator },
    { value: 'secretary', label: tr.role_secretary },
    { value: 'intern', label: tr.role_intern },
  ]
  const [inviteNow, setInviteNow] = useState(true)
  const [rows, setRows] = useState<InviteRow[]>(DEFAULT_ROWS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Lu côté client après montage (pas dans l'état initial) pour rester
  // identique au rendu serveur et éviter un mismatch d'hydratation.
  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTER_CABINET_TEAM_COUNTS_KEY)
    if (!raw) return
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle de sessionStorage au montage, pas une synchro externe continue
      setRows(rowsFromTeamCounts(JSON.parse(raw)))
    } catch {
      // valeur corrompue — on garde la ligne par défaut
    }
  }, [])

  const submit = async () => {
    setError('')
    if (inviteNow) {
      const filled = rows.filter((r) => r.name.trim() && r.email.trim())
      const missingSupervisor = filled.some((r) => r.role === 'intern' && !r.supervisorRowId)
      if (missingSupervisor) {
        setError(tr.supervisor_missing_error)
        return
      }
      if (filled.length) {
        setLoading(true)
        const { sent, failed } = await sendInvites(rows)
        setLoading(false)
        if (failed.length) {
          showToast(
            tr.toast_invites_partial
              .replace('{sent}', String(sent))
              .replace('{failed}', String(failed.length))
              .replace('{list}', failed.join(', '))
          )
        } else if (sent) {
          showToast(tr.toast_invites_success.replace('{n}', String(sent)))
        }
      }
    }
    router.push('/register/plan')
  }

  return (
    <Card style={{ maxWidth: 520 }}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>
            {tr.cabinvite_title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.cabinvite_step_caption}</p>
        </div>

        <div className="flex gap-2" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius)', padding: 3, border: '1px solid var(--color-border)' }}>
          {[{ id: true, label: tr.invite_now }, { id: false, label: tr.invite_later }].map((opt) => (
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
          <InviteList rows={rows} setRows={setRows} roleOptions={ROLE_OPTIONS} supervisableRoles={['owner', 'collaborator']} />
        )}

        {error && <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>{error}</p>}

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : tr.continue}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/register/cabinet/team')}>{tr.back}</Btn>
        </div>
      </div>
    </Card>
  )
}
