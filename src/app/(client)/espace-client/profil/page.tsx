'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Divider } from '@/components/ui/Divider'
import { Toggle } from '@/components/ui/Toggle'
import { Btn } from '@/components/ui/Btn'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'
import { useLang } from '@/providers/LangProvider'
import { createClient } from '@/lib/supabase/client'

export default function ClientProfilePage() {
  const { tr } = useLang()
  const { showToast } = useToast()
  const { clientProfile, refresh: refreshSession } = useClientSession()
  const { clients, refresh: refreshData } = useAppData()
  const client = clients.find((c) => c.id === clientProfile?.id)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySms, setNotifySms] = useState(false)
  const [loadedClientId, setLoadedClientId] = useState<string | null>(null)

  // Charge les données du client dans le formulaire dès qu'elles arrivent, sans passer
  // par un effet (évite le rendu en cascade signalé par react-hooks/set-state-in-effect).
  if (client && client.id !== loadedClientId) {
    setLoadedClientId(client.id)
    setForm({ name: client.name, email: client.email, phone: client.phone, address: client.address, city: client.city })
    setNotifyEmail(client.notificationPreferences.email)
    setNotifySms(client.notificationPreferences.sms)
  }

  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const save = async () => {
    if (!client) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('clients')
      .update({
        name: form.name,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        notification_preferences: { email: notifyEmail, sms: notifySms },
      })
      .eq('id', client.id)
    setSaving(false)
    if (error) {
      showToast(tr.client_profile_save_error)
      return
    }
    await Promise.all([refreshData(), refreshSession()])
    showToast(tr.client_profile_save_success)
  }

  if (!client) {
    return <p style={{ padding: 24, fontSize: 14, color: 'var(--color-muted-foreground)' }}>{tr.client_profile_no_client}</p>
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.client_profile_title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.client_profile_subtitle}</p>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{tr.client_profile_contact_section_title}</h2>
          <div className="flex flex-col gap-4">
            <Input label={tr.common_name} value={form.name} onChange={f('name')} />
            <Input label={tr.common_email} type="email" value={form.email} onChange={() => {}} disabled hint={tr.client_profile_email_hint} />
            <Input label={tr.common_phone} type="tel" value={form.phone} onChange={f('phone')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={tr.common_address} value={form.address} onChange={f('address')} />
              <Input label={tr.common_city} value={form.city} onChange={f('city')} />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{tr.client_profile_security_section_title}</h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {tr.client_profile_password_hint}
          </p>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{tr.client_profile_notifications_section_title}</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{tr.client_profile_email_alerts}</span>
              <Toggle size="sm" checked={notifyEmail} onChange={() => setNotifyEmail(!notifyEmail)} />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{tr.client_profile_sms_alerts}</span>
              <Toggle size="sm" checked={notifySms} onChange={() => setNotifySms(!notifySms)} />
            </div>
          </div>
        </div>

        <Divider />

        <Btn fullWidth onClick={save} disabled={saving}>{saving ? '…' : tr.client_profile_save_button}</Btn>
      </div>
    </div>
  )
}
