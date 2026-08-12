'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Divider } from '@/components/ui/Divider'
import { Toggle } from '@/components/ui/Toggle'
import { Btn } from '@/components/ui/Btn'
import { useToast } from '@/providers/ToastProvider'
import { useSession } from '@/providers/SessionProvider'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { realProfile, cabinetName, cabinetAddress, cabinetId, refreshProfile } = useSession()
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' })
  const [firm, setFirm] = useState({ name: '', address: '' })
  const [notifications, setNotifications] = useState({ email: true, sms: false, hearings: true, invoices: true })
  const [has2fa, setHas2fa] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (realProfile) {
      setProfile({ firstName: realProfile.firstName, lastName: realProfile.lastName, phone: realProfile.phone })
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
      .update({ first_name: profile.firstName, last_name: profile.lastName, phone: profile.phone || null })
      .eq('id', realProfile.id)

    let cabinetError = null
    if (cabinetId) {
      const { error } = await supabase.from('cabinets').update({ name: firm.name, address: firm.address || null }).eq('id', cabinetId)
      cabinetError = error
    }
    setSaving(false)
    if (profileError || cabinetError) {
      showToast("Erreur lors de l'enregistrement")
      return
    }
    await refreshProfile()
    showToast('Paramètres enregistrés')
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Paramètres</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Profil, sécurité, cabinet et notifications</p>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Profil</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Prénom" value={profile.firstName} onChange={f('firstName')} />
              <Input label="Nom" value={profile.lastName} onChange={f('lastName')} />
            </div>
            <Input label="Adresse e-mail" type="email" value={realProfile?.email ?? ''} onChange={() => {}} disabled hint="L'email de connexion ne se modifie pas ici." />
            <Input label="Téléphone" type="tel" value={profile.phone} onChange={f('phone')} />
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Cabinet</h2>
          <div className="flex flex-col gap-4">
            <Input label="Nom du cabinet" value={firm.name} onChange={g('name')} />
            <Input label="Adresse" value={firm.address} onChange={g('address')} />
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Sécurité</h2>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Authentification à deux facteurs</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 2 }}>
                {has2fa ? 'Activée sur ce compte' : "Protège l'accès à votre compte"}
              </div>
            </div>
            {has2fa ? (
              <Toggle checked disabled onChange={() => {}} />
            ) : (
              <Btn variant="secondary" onClick={() => router.push('/2fa-setup')}>Configurer</Btn>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Délais légaux (Tunisie)</h2>
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: 0 }}>Référentiel des délais de recours (CPCC) — à vérifier avant utilisation</p>
            </div>
            <Btn variant="secondary" onClick={() => router.push('/settings/deadlines')}>Configurer</Btn>
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Notifications</h2>
          <div className="flex flex-col gap-3">
            {[
              { key: 'email' as const, label: 'Notifications par e-mail' },
              { key: 'sms' as const, label: 'Notifications par SMS' },
              { key: 'hearings' as const, label: 'Rappels d\'audiences' },
              { key: 'invoices' as const, label: 'Factures et paiements' },
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

        <Btn fullWidth onClick={save} disabled={saving}>{saving ? '…' : 'Enregistrer les modifications'}</Btn>
      </div>
    </div>
  )
}
