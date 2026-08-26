'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { Btn } from '@/components/ui/Btn'
import { Toggle } from '@/components/ui/Toggle'
import { RoleBadge } from '@/components/members/RoleBadge'
import { BaseMemberFields, MemberFormFields } from '@/components/members/BaseMemberFields'
import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/permissions'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'
import { useLang } from '@/providers/LangProvider'

export default function MembersFormSecretaryPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { addMember, setMemberPermissionOverride } = useAppData()
  const { tr } = useLang()
  const [form, setForm] = useState<MemberFormFields>({ firstName: '', lastName: '', email: '', phone: '' })
  const [perms, setPerms] = useState({ finance: false, ai: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    const result = await addMember({ ...form, role: 'secretary' })
    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }
    if (perms.finance || perms.ai) {
      await setMemberPermissionOverride(result.id, {
        ...ROLE_DEFAULT_PERMISSIONS.secretary,
        viewPayments: perms.finance,
        useAiTools: perms.ai,
      })
    }
    setLoading(false)
    sessionStorage.setItem(`mouhamiplus-member-access-${result.id}`, JSON.stringify({ tempPassword: result.tempPassword }))
    showToast(result.emailed ? tr.member_add_toast_emailed : tr.member_add_toast_temp_password)
    router.push(`/members/${result.id}`)
  }

  return (
    <Card style={{ maxWidth: 500 }}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <RoleBadge role="secretary" size="md" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, margin: 0 }}>
            {tr.member_add_secretary_title}
          </h1>
        </div>

        <BaseMemberFields form={form} setForm={setForm} />

        <Divider text={tr.member_secretary_permissions_divider} />

        <div className="flex flex-col gap-3">
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {tr.member_secretary_permissions_intro}
          </p>
          {[
            { key: 'finance' as const, label: tr.member_secretary_finance_label, desc: tr.member_secretary_finance_desc },
            { key: 'ai' as const, label: tr.member_secretary_ai_label, desc: tr.member_secretary_ai_desc },
          ].map((p) => (
            <div
              key={p.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                background: perms[p.key] ? 'rgba(22, 35, 63,0.02)' : 'var(--color-secondary)',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{p.desc}</div>
              </div>
              <Toggle
                size="sm"
                checked={perms[p.key]}
                onChange={() => setPerms((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
              />
            </div>
          ))}
        </div>

        {error && <p style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}>{error}</p>}

        <div className="flex flex-col gap-2">
          <Btn fullWidth onClick={submit} disabled={loading}>{loading ? '…' : tr.member_create_secretary_button}</Btn>
          <Btn fullWidth variant="ghost" onClick={() => router.push('/members/add')}>{tr.shell_back}</Btn>
        </div>
      </div>
    </Card>
  )
}
