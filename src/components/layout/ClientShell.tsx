'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { LangSelector } from '@/components/ui/LangSelector'
import { Avatar } from '@/components/members/Avatar'
import { NotificationBell } from './NotificationBell'
import { useLang } from '@/providers/LangProvider'
import { useToast } from '@/providers/ToastProvider'
import { useAppData, Case } from '@/providers/AppDataProvider'
import { useClientSession } from '@/providers/ClientSessionProvider'
import { IconHome, IconFolder, IconCalendar, IconArchive, IconInvoice, IconGear, IconMenu, IconClose } from '@/components/ui/icons'

function initialsOf(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

const SIDEBAR_NAV: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: '/espace-client/dashboard', label: 'Tableau de bord', icon: <IconHome /> },
  { id: '/espace-client/dossiers', label: 'Mes dossiers', icon: <IconFolder /> },
  { id: '/espace-client/rendez-vous', label: 'Mes rendez-vous', icon: <IconCalendar /> },
  { id: '/espace-client/documents', label: 'Mes documents', icon: <IconArchive /> },
  { id: '/espace-client/factures', label: 'Mes factures', icon: <IconInvoice /> },
  { id: '/espace-client/profil', label: 'Mon profil', icon: <IconGear /> },
]

const BREADCRUMBS: Record<string, string[]> = {
  '/espace-client/dashboard': ['Tableau de bord'],
  '/espace-client/dossiers': ['Mes dossiers'],
  '/espace-client/rendez-vous': ['Mes rendez-vous'],
  '/espace-client/documents': ['Mes documents'],
  '/espace-client/factures': ['Mes factures'],
  '/espace-client/profil': ['Mon profil'],
}

const CLIENT_CASE_RE = /^\/espace-client\/dossiers\/([^/]+)$/

function getBreadcrumb(pathname: string, cases: Case[]): string[] {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname]
  const match = pathname.match(CLIENT_CASE_RE)
  if (match) {
    const c = cases.find((x) => x.id === match[1])
    return ['Mes dossiers', c?.title ?? 'Dossier']
  }
  return []
}

function getBackTarget(pathname: string): string | undefined {
  if (CLIENT_CASE_RE.test(pathname)) return '/espace-client/dossiers'
  return undefined
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { lang, setLang } = useLang()
  const { toast } = useToast()
  const { cases } = useAppData()
  const { clientProfile, signOut } = useClientSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const breadcrumb = getBreadcrumb(pathname, cases)
  const backTarget = getBackTarget(pathname)

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
              Espace client
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
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {SIDEBAR_NAV.map((item) => {
            const isActive = pathname === item.id || pathname.startsWith(item.id + '/')
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
                  background: isActive ? 'rgba(22, 35, 63, 0.08)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-foreground)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63, 0.04)' }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
                {isActive && (
                  <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Avatar initials={clientProfile ? initialsOf(clientProfile.name) : '??'} size={30} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {clientProfile?.name ?? '…'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>Client</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <LangSelector lang={lang} setLang={setLang} />
            <button
              onClick={() => { signOut(); router.push('/espace-client/login') }}
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
            background: 'rgba(247, 247, 245, 0.9)',
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
          <NotificationBell audience="client" />
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
