'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Divider } from '@/components/ui/Divider'
import { Toggle } from '@/components/ui/Toggle'
import { Btn } from '@/components/ui/Btn'
import { useToast } from '@/providers/ToastProvider'
import { useSession } from '@/providers/SessionProvider'
import { useLang } from '@/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { tr } = useLang()
  const { realProfile, cabinetName, cabinetAddress, cabinetId, refreshProfile } = useSession()
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' })
  const [firm, setFirm] = useState({ name: '', address: '' })
  const [notifications, setNotifications] = useState({ email: true, sms: false, hearings: true, invoices: true })
  const [has2fa, setHas2fa] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (realProfile) {
      setProfile({ firstName: realProfile.firstName, lastName: realProfile.lastName, phone: realProfile.phone })
      const supabase = createClient()
      supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', realProfile.id)
        .single()
        .then(({ data }) => {
          const prefs = data?.notification_preferences as Partial<typeof notifications> | null
          if (prefs) setNotifications((prev) => ({ ...prev, ...prefs }))
        })
    }
  }, [realProfile])

  useEffect(() => {
    setFirm({ name: cabinetName ?? '', address: cabinetAddress ?? '' })
  }, [cabinetName, cabinetAddress])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.mfa.listFactors().then(({ data }) => {
      setHas2fa(Boolean(data?.totp && data.totp.length > 0))
    })
  }, [])

  const f = (k: keyof typeof profile) => (v: string) => setProfile((p) => ({ ...p, [k]: v }))
  const g = (k: keyof typeof firm) => (v: string) => setFirm((p) => ({ ...p, [k]: v }))

  const save = async () => {
    if (!realProfile) return
    setSaving(true)
    const supabase = createClient()
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone || null,
        notification_preferences: notifications,
      })
      .eq('id', realProfile.id)

    let cabinetError = null
    if (cabinetId && realProfile.role === 'owner') {
      // .select() est nécessaire pour détecter un blocage RLS : sans lui, une mise à jour
      // refusée par la policy (0 ligne affectée) renvoie quand même 204 sans `error`.
      const { data, error } = await supabase
        .from('cabinets')
        .update({ name: firm.name, address: firm.address || null })
        .eq('id', cabinetId)
        .select('id')
      cabinetError = error ?? (data && data.length === 0 ? new Error('cabinet_update_blocked') : null)
    }
    setSaving(false)
    if (profileError || cabinetError) {
      showToast(tr.settings_save_toast_error)
      return
    }
    await refreshProfile()
    showToast(tr.settings_save_toast_success)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.nav_settings}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.settings_subtitle}</p>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{tr.settings_profile_section}</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={tr.settings_first_name} value={profile.firstName} onChange={f('firstName')} />
              <Input label={tr.common_name} value={profile.lastName} onChange={f('lastName')} />
            </div>
            <Input label={tr.common_email} type="email" value={realProfile?.email ?? ''} onChange={() => {}} disabled hint={tr.settings_email_readonly_hint} />
            <Input label={tr.common_phone} type="tel" value={profile.phone} onChange={f('phone')} />
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{tr.settings_firm_section}</h2>
          <div className="flex flex-col gap-4">
            <Input label={tr.settings_firm_name} value={firm.name} onChange={g('name')} disabled={realProfile?.role !== 'owner'} />
            <Input label={tr.common_address} value={firm.address} onChange={g('address')} disabled={realProfile?.role !== 'owner'} />
            {realProfile?.role !== 'owner' && (
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: 0 }}>
                {tr.settings_firm_owner_only}
              </p>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{tr.settings_security_section}</h2>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{tr.settings_2fa_label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 2 }}>
                {has2fa ? tr.settings_2fa_enabled_hint : tr.settings_2fa_disabled_hint}
              </div>
            </div>
            {has2fa ? (
              <Toggle checked disabled onChange={() => {}} />
            ) : (
              <Btn variant="secondary" onClick={() => router.push('/2fa-setup')}>{tr.settings_configure_button}</Btn>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{tr.settings_deadlines_section}</h2>
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.settings_deadlines_hint}</p>
            </div>
            <Btn variant="secondary" onClick={() => router.push('/settings/deadlines')}>{tr.settings_configure_button}</Btn>
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{tr.settings_notifications_section}</h2>
          <div className="flex flex-col gap-3">
            {[
              { key: 'email' as const, label: tr.settings_notif_email },
              { key: 'sms' as const, label: tr.settings_notif_sms },
              { key: 'hearings' as const, label: tr.settings_notif_hearings },
              { key: 'invoices' as const, label: tr.settings_notif_invoices },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between">
                <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{n.label}</span>
                <Toggle
                  size="sm"
                  checked={notifications[n.key]}
                  onChange={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                />
              </div>
            ))}
          </div>
        </div>

        <Divider />

        <Btn fullWidth onClick={save} disabled={saving}>{saving ? '…' : tr.settings_save_button}</Btn>
      </div>
    </div>
  )
}
