'use client'

import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Avatar } from '@/components/members/Avatar'
import { RoleBadge } from '@/components/members/RoleBadge'
import { MemberRole } from '@/lib/members-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useSession } from '@/providers/SessionProvider'
import { IconFolder, IconUsers, IconTeam, IconClipboard, IconScale, IconCheck, IconCash } from '@/components/ui/icons'

const DATE_LABEL = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const quickActions = [
  { label: 'Nouveau dossier', desc: 'Ouvrir un dossier', icon: <IconFolder size={20} />, target: '/cases/add' },
  { label: 'Nouveau client', desc: 'Ajouter une fiche client', icon: <IconUsers size={20} />, target: '/clients/add' },
  { label: 'Gérer les membres', desc: 'Équipe du cabinet', icon: <IconTeam size={20} />, target: '/members' },
  { label: "Journal d'audit", desc: 'Traçabilité des actions', icon: <IconClipboard size={20} />, target: '/members/audit' },
]

const recentAudit = [
  { user: 'Nadia Chaouachi', action: 'Ajout document', entity: 'Assignation_v3.pdf', time: 'il y a 1h', role: 'secretary' as MemberRole },
  { user: 'Yassine Karray', action: 'Modification dossier', entity: 'Bensalem c/ TechTun', time: 'il y a 3h', role: 'collaborator' as MemberRole },
  { user: 'Salma Ben Fredj', action: 'Consultation', entity: 'Litige Gharbi', time: 'Hier 17h28', role: 'intern' as MemberRole },
]

export default function DashboardPage() {
  const router = useRouter()
  const { cases, members, clients, notifications, markNotificationRead, payments } = useAppData()
  const { currentUserName, cabinetName } = useSession()
  const cabinetNotifications = notifications.filter((n) => n.audience === 'cabinet')

  const today = new Date().toISOString().slice(0, 10)
  const openCases = cases.filter((c) => c.status !== 'closed')
  const upcomingHearings = cases
    .filter((c) => c.nextHearing)
    .sort((a, b) => (a.nextHearing! < b.nextHearing! ? -1 : 1))
  const todaysTasks = cases.flatMap((c) => c.tasks.filter((t) => !t.done && t.dueDate === today))
  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)

  const stats = [
    { label: 'Dossiers en cours', value: String(openCases.length), sub: `${cases.length} au total`, icon: <IconFolder size={20} /> },
    {
      label: 'Audiences à venir',
      value: String(upcomingHearings.length),
      sub: upcomingHearings[0] ? `Prochaine le ${new Date(upcomingHearings[0].nextHearing!).toLocaleDateString('fr-FR')}` : 'Aucune programmée',
      icon: <IconScale size={20} />,
    },
    { label: "Tâches du jour", value: String(todaysTasks.length), sub: "À traiter aujourd'hui", icon: <IconCheck size={20} /> },
    { label: 'Revenus encaissés', value: `${totalRevenue.toLocaleString('fr-FR')} DT`, sub: 'Total à ce jour', icon: <IconCash size={20} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, margin: '0 0 4px' }}>
          Bonjour, {currentUserName || '…'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', margin: 0, textTransform: 'capitalize' }}>
          {cabinetName ?? 'Mon cabinet'} · {DATE_LABEL.format(new Date())}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(28,20,16,0.04)',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Notifications */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
            Notifications
          </h2>
          <div className="flex flex-col gap-0">
            {cabinetNotifications.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Aucune notification.</p>
            )}
            {cabinetNotifications.map((n, i) => (
              <div
                key={n.id}
                onClick={() => { markNotificationRead(n.id); router.push(n.href) }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 0',
                  cursor: 'pointer',
                  borderBottom: i < cabinetNotifications.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: 6 }} />}
                <span style={{ fontSize: 13, color: 'var(--color-foreground)', lineHeight: 1.4, fontWeight: n.read ? 400 : 500 }}>{n.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: 0 }}>
              Activité récente
            </h2>
            <button
              onClick={() => router.push('/members/audit')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
            >
              Voir tout →
            </button>
          </div>
          <div className="flex flex-col gap-0">
            {recentAudit.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: i < recentAudit.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <Avatar initials={a.user.split(' ').map((w) => w[0]).join('').slice(0, 2)} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)' }}>
                    {a.user} <span style={{ fontWeight: 400, color: 'var(--color-muted-foreground)' }}>— {a.action}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.entity}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2 }}>
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
          Accès rapide
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => router.push(a.target)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                background: 'var(--color-background)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63,0.02)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                ;(e.currentTarget as HTMLElement).style.background = 'var(--color-background)'
              }}
            >
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)' }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 1 }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming hearings */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: 0 }}>Audiences à venir</h2>
          <Btn onClick={() => router.push('/hearings')}>Voir le calendrier</Btn>
        </div>
        <div className="flex flex-col gap-0">
          {upcomingHearings.slice(0, 4).map((c, i) => (
            <div
              key={c.id}
              onClick={() => router.push(`/cases/${c.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: i < Math.min(upcomingHearings.length, 4) - 1 ? '1px solid var(--color-border)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', minWidth: 90 }}>
                {new Date(c.nextHearing!).toLocaleDateString('fr-FR')}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-foreground)', flex: 1 }}>{c.title}</span>
              <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{clients.find((cl) => cl.id === c.clientId)?.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Members quick view */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: 0 }}>Membres du cabinet</h2>
          <Btn onClick={() => router.push('/members')}>Gérer les membres</Btn>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {members.map((m) => (
            <div
              key={m.id}
              style={{
                padding: '12px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--color-background)',
              }}
            >
              <Avatar initials={m.avatar} size={30} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.firstName} {m.lastName}
                </div>
                <div style={{ marginTop: 3 }}>
                  <RoleBadge role={m.role} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
