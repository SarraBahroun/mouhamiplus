'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Divider } from '@/components/ui/Divider'
import { Toggle } from '@/components/ui/Toggle'
import { Btn } from '@/components/ui/Btn'
import { useToast } from '@/providers/ToastProvider'
import { useAppData } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'
import { createClient } from '@/lib/supabase/client'

export default function ClientProfilePage() {
  const { showToast } = useToast()
  const { clientProfile, refresh: refreshSession } = useClientSession()
  const { clients, refresh: refreshData } = useAppData()
  const client = clients.find((c) => c.id === clientProfile?.id)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySms, setNotifySms] = useState(false)

  useEffect(() => {
    if (client) {
      setForm({ name: client.name, email: client.email, phone: client.phone, address: client.address, city: client.city })
    }
  }, [client])

  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const save = async () => {
    if (!client) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('clients')
      .update({ name: form.name, phone: form.phone || null, address: form.address || null, city: form.city || null })
      .eq('id', client.id)
    setSaving(false)
    if (error) {
      showToast("Erreur lors de l'enregistrement")
      return
    }
    await Promise.all([refreshData(), refreshSession()])
    showToast('Profil mis à jour')
  }

  if (!client) {
    return <p style={{ padding: 24, fontSize: 14, color: 'var(--color-muted-foreground)' }}>Aucune fiche client associée à ce compte pour le moment.</p>
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Mon profil</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>Coordonnées et sécurité de votre compte</p>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Coordonnées</h2>
          <div className="flex flex-col gap-4">
            <Input label="Nom complet" value={form.name} onChange={f('name')} />
            <Input label="Adresse e-mail" type="email" value={form.email} onChange={() => {}} disabled hint="L'email de connexion ne se modifie pas ici." />
            <Input label="Téléphone" type="tel" value={form.phone} onChange={f('phone')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Adresse" value={form.address} onChange={f('address')} />
              <Input label="Ville" value={form.city} onChange={f('city')} />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Sécurité</h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Pour changer votre mot de passe, utilisez le lien « Mot de passe oublié » depuis la page de connexion.
          </p>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Notifications</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>Alertes par e-mail</span>
              <Toggle size="sm" checked={notifyEmail} onChange={() => setNotifyEmail(!notifyEmail)} />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 14, color: 'var(--color-foreground)' }}>Alertes par SMS</span>
              <Toggle size="sm" checked={notifySms} onChange={() => setNotifySms(!notifySms)} />
            </div>
          </div>
        </div>

        <Divider />

        <Btn fullWidth onClick={save} disabled={saving}>{saving ? '…' : 'Enregistrer les modifications'}</Btn>
      </div>
    </div>
  )
}
