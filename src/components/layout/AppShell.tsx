'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { LangSelector } from '@/components/ui/LangSelector'
import { Avatar } from '@/components/members/Avatar'
import { NotificationBell } from './NotificationBell'
import { useLang } from '@/providers/LangProvider'
import { useToast } from '@/providers/ToastProvider'
import { useAppData, Client, Case } from '@/providers/AppDataProvider'
import { useSession, CurrentUserId } from '@/providers/SessionProvider'
import { PermissionKey } from '@/lib/permissions'
import { ROLE_META } from '@/lib/members-data'
import {
  IconHome, IconChat, IconUsers, IconFolder, IconScale, IconCalendar, IconArchive, IconCamera,
  IconSearch, IconSparkle, IconReceipt, IconBot, IconScroll, IconMail, IconInvoice, IconCreditCard,
  IconBarChart, IconTeam, IconClipboard, IconLock, IconGear, IconMenu, IconClose,
} from '@/components/ui/icons'

const SIDEBAR_NAV: { id: string; label: string; icon: React.ReactNode; section?: string; permission?: PermissionKey }[] = [
  { id: '/dashboard', label: 'Tableau de bord', icon: <IconHome /> },
  { id: '/messages', label: 'Messages & RDV', icon: <IconChat />, section: 'Espace client' },
  { id: '/clients', label: 'Clients', icon: <IconUsers />, section: 'Clientèle', permission: 'manageClients' },
  { id: '/cases', label: 'Dossiers', icon: <IconFolder />, section: 'Clientèle', permission: 'createCase' },
  { id: '/hearings', label: 'Audiences', icon: <IconScale />, section: 'Agenda', permission: 'manageCalendar' },
  { id: '/calendar', label: 'Calendrier', icon: <IconCalendar />, section: 'Agenda', permission: 'manageCalendar' },
  { id: '/documents', label: 'Documents', icon: <IconArchive />, section: 'Documents & IA', permission: 'manageDocuments' },
  { id: '/ocr', label: 'Scanner OCR', icon: <IconCamera />, section: 'Documents & IA', permission: 'manageDocuments' },
  { id: '/search', label: 'Recherche', icon: <IconSearch />, section: 'Documents & IA' },
  { id: '/ai/generate', label: 'Génération IA', icon: <IconSparkle />, section: 'Documents & IA', permission: 'useAiTools' },
  { id: '/ai/summary', label: 'Résumé automatique', icon: <IconReceipt />, section: 'Documents & IA', permission: 'useAiTools' },
  { id: '/ai/assistant', label: 'Assistant juridique IA', icon: <IconBot />, section: 'Documents & IA', permission: 'useAiTools' },
  { id: '/contracts', label: 'Contrats', icon: <IconScroll />, section: 'Facturation', permission: 'viewPayments' },
  { id: '/correspondence', label: 'Courriers', icon: <IconMail />, section: 'Facturation', permission: 'viewPayments' },
  { id: '/invoices', label: 'Factures', icon: <IconInvoice />, section: 'Facturation', permission: 'viewPayments' },
  { id: '/payments', label: 'Paiements', icon: <IconCreditCard />, section: 'Facturation', permission: 'viewPayments' },
  { id: '/reports', label: 'Rapports', icon: <IconBarChart />, section: 'Pilotage', permission: 'viewPayments' },
  { id: '/members', label: 'Membres', icon: <IconTeam />, section: 'Cabinet', permission: 'manageUsers' },
  { id: '/members/audit', label: "Journal d'audit", icon: <IconClipboard />, section: 'Cabinet', permission: 'manageUsers' },
  { id: '/sessions', label: 'Sessions actives', icon: <IconLock />, section: 'Compte' },
  { id: '/settings', label: 'Paramètres', icon: <IconGear />, section: 'Compte', permission: 'accessSettings' },
]

const BREADCRUMBS: Record<string, string[]> = {
  '/dashboard': ['Tableau de bord'],
  '/messages': ['Messages & RDV'],
  '/clients': ['Clients'],
  '/clients/add': ['Clients', 'Nouveau client'],
  '/cases': ['Dossiers'],
  '/cases/add': ['Dossiers', 'Nouveau dossier'],
  '/hearings': ['Audiences'],
  '/calendar': ['Calendrier'],
  '/documents': ['Documents'],
  '/ocr': ['Scanner OCR'],
  '/search': ['Recherche'],
  '/ai/generate': ['Documents & IA', 'Génération de documents'],
  '/ai/summary': ['Documents & IA', 'Résumé automatique'],
  '/ai/assistant': ['Documents & IA', 'Assistant juridique IA'],
  '/contracts': ['Contrats'],
  '/correspondence': ['Courriers'],
  '/invoices': ['Factures'],
  '/payments': ['Paiements'],
  '/reports': ['Rapports'],
  '/sessions': ['Compte', 'Sessions actives'],
  '/settings': ['Compte', 'Paramètres'],
  '/members': ['Membres du cabinet'],
  '/members/add': ['Membres du cabinet', 'Ajouter un membre'],
  '/members/add/secretary': ['Membres du cabinet', 'Ajouter un membre', 'Secrétaire'],
  '/members/add/collaborator': ['Membres du cabinet', 'Ajouter un membre', 'Collaborateur'],
  '/members/add/intern': ['Membres du cabinet', 'Ajouter un membre', 'Stagiaire'],
  '/members/audit': ['Cabinet', "Journal d'audit"],
}

const BACK_FLOW: Record<string, string> = {
  '/clients/add': '/clients',
  '/cases/add': '/cases',
  '/members/add': '/members',
  '/members/add/secretary': '/members/add',
  '/members/add/collaborator': '/members/add',
  '/members/add/intern': '/members/add',
}

const MEMBER_PROFILE_RE = /^\/members\/[^/]+$/
const MEMBER_PERMISSIONS_RE = /^\/members\/[^/]+\/permissions$/
const CLIENT_PROFILE_RE = /^\/clients\/([^/]+)$/
const CASE_DETAIL_RE = /^\/cases\/([^/]+)$/

function getBreadcrumb(pathname: string, clients: Client[], cases: Case[]): string[] {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname]
  if (MEMBER_PERMISSIONS_RE.test(pathname)) return ['Membres du cabinet', 'Permissions']
  if (MEMBER_PROFILE_RE.test(pathname)) return ['Membres du cabinet', 'Profil membre']
  const clientMatch = pathname.match(CLIENT_PROFILE_RE)
  if (clientMatch) {
    const client = clients.find((c) => c.id === clientMatch[1])
    return ['Clients', client?.name ?? 'Fiche client']
  }
  const caseMatch = pathname.match(CASE_DETAIL_RE)
  if (caseMatch) {
    const c = cases.find((x) => x.id === caseMatch[1])
    return ['Dossiers', c?.title ?? 'Dossier']
  }
  return []
}

function getBackTarget(pathname: string): string | undefined {
  if (BACK_FLOW[pathname]) return BACK_FLOW[pathname]
  if (MEMBER_PROFILE_RE.test(pathname) || MEMBER_PERMISSIONS_RE.test(pathname)) return '/members'
  if (CLIENT_PROFILE_RE.test(pathname)) return '/clients'
  if (CASE_DETAIL_RE.test(pathname)) return '/cases'
  return undefined
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { lang, setLang } = useLang()
  const { toast } = useToast()
  const { clients, cases, members, appointmentRequests } = useAppData()
  const { currentUserId, setCurrentUserId, currentUserName, currentUserRoleLabel, currentUserInitials, hasPermission, realProfile, cabinetName, signOut } = useSession()
  const pendingRequestCount = appointmentRequests.filter((r) => r.status === 'pending').length
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const visibleNav = SIDEBAR_NAV.filter((n) => !n.permission || hasPermission(n.permission))
  const sections = Array.from(new Set(visibleNav.filter((n) => n.section).map((n) => n.section as string)))
  const breadcrumb = getBreadcrumb(pathname, clients, cases)
  const backTarget = getBackTarget(pathname)

  const groupedNav = [
    { section: null, items: visibleNav.filter((n) => !n.section) },
    ...sections.map((sec) => ({ section: sec, items: visibleNav.filter((n) => n.section === sec) })),
  ]

  const viewAsOptions: { id: CurrentUserId; label: string }[] = [
    { id: 'self', label: realProfile ? `Me. ${realProfile.firstName} ${realProfile.lastName} (${ROLE_META[realProfile.role].label})` : 'Moi' },
    ...members.map((m) => ({ id: m.id, label: `${m.firstName} ${m.lastName} (${ROLE_META[m.role].label})` })),
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Backdrop (mobile only) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(18,21,28,0.4)', zIndex: 25 }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--color-card)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 30,
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Logo size="sm" />
            <p style={{ margin: '6px 0 0', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.04em' }}>
              {cabinetName ?? 'Mon cabinet'}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: 4 }}
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {groupedNav.map((group) => (
            <div key={group.section ?? 'main'} style={{ marginBottom: 8 }}>
              {group.section && (
                <div style={{ padding: '6px 8px 4px', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {group.section}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = item.id === '/members'
                  ? pathname.startsWith('/members') && !pathname.startsWith('/members/audit')
                  : pathname === item.id || pathname.startsWith(item.id + '/')
                return (
                  <button
                    key={item.id}
                    onClick={() => { router.push(item.id); setSidebarOpen(false) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 4,
                      border: 'none',
                      background: isActive ? 'rgba(22, 35, 63,0.08)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-foreground)',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'left',
                      transition: 'background 0.12s, color 0.12s',
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63,0.04)' }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    {item.label}
                    {item.id === '/messages' && pendingRequestCount > 0 ? (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 9,
                          background: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                          color: isActive ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                          flexShrink: 0,
                        }}
                      >
                        {pendingRequestCount}
                      </span>
                    ) : (
                      isActive && (
                        <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                      )
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Avatar initials={currentUserInitials} size={30} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUserName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>{currentUserRoleLabel}</div>
            </div>
          </div>
          {realProfile?.role === 'owner' && (
            <select
              value={String(currentUserId)}
              onChange={(e) => setCurrentUserId(e.target.value)}
              title="Voir en tant que"
              style={{
                width: '100%',
                marginBottom: 10,
                padding: '5px 6px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                background: 'var(--color-secondary)',
                color: 'var(--color-foreground)',
                cursor: 'pointer',
              }}
            >
              {viewAsOptions.map((opt) => (
                <option key={String(opt.id)} value={String(opt.id)}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          <div className="flex items-center justify-between">
            <LangSelector lang={lang} setLang={setLang} />
            <button
              onClick={() => { signOut(); router.push('/login') }}
              title="Déconnexion"
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-muted-foreground)',
                transition: 'color 0.12s',
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:ml-[220px]" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            height: 52,
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
            background: 'rgba(247, 247, 245,0.9)',
            backdropFilter: 'blur(8px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-foreground)', display: 'flex', alignItems: 'center', padding: 4, marginRight: 4, flexShrink: 0 }}
          >
            <IconMenu size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', minWidth: 0, flex: 1 }}>
          {backTarget && (
            <button
              onClick={() => router.push(backTarget)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted-foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                padding: '4px 8px 4px 4px',
                borderRadius: 4,
                transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-muted-foreground)')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Retour
            </button>
          )}
          {backTarget && <div style={{ width: 1, height: 16, background: 'var(--color-border)' }} />}
          {breadcrumb.map((crumb, i) => (
            <span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <span style={{ color: 'var(--color-border)', fontSize: 12 }}>›</span>}
              <span
                style={{
                  fontSize: 13,
                  color: i === breadcrumb.length - 1 ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  fontWeight: i === breadcrumb.length - 1 ? 500 : 400,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {crumb}
              </span>
            </span>
          ))}
          </div>
          <NotificationBell audience="cabinet" />
        </header>

        {/* Content */}
        <main className="p-4 lg:px-8 lg:pt-7 lg:pb-20" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 200,
            background: '#12151C',
            color: 'white',
            padding: '12px 18px',
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            animation: 'slideUp 0.2s ease',
          }}
        >
          <span style={{ color: '#27AE60', fontSize: 16 }}>✓</span>
          {toast}
        </div>
      )}
    </div>
  )
}
