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

function buildSidebarNav(tr: Record<string, string>): { id: string; label: string; icon: React.ReactNode; section?: string; permission?: PermissionKey }[] {
  return [
    { id: '/dashboard', label: tr.nav_dashboard, icon: <IconHome /> },
    { id: '/messages', label: tr.nav_messages, icon: <IconChat />, section: tr.section_client_space },
    { id: '/clients', label: tr.nav_clients, icon: <IconUsers />, section: tr.section_clientele, permission: 'manageClients' },
    { id: '/cases', label: tr.nav_cases, icon: <IconFolder />, section: tr.section_clientele, permission: 'createCase' },
    { id: '/hearings', label: tr.nav_hearings, icon: <IconScale />, section: tr.section_agenda, permission: 'manageCalendar' },
    { id: '/calendar', label: tr.nav_calendar, icon: <IconCalendar />, section: tr.section_agenda, permission: 'manageCalendar' },
    { id: '/documents', label: tr.nav_documents, icon: <IconArchive />, section: tr.section_documents_ai, permission: 'manageDocuments' },
    { id: '/ocr', label: tr.nav_ocr, icon: <IconCamera />, section: tr.section_documents_ai, permission: 'manageDocuments' },
    { id: '/search', label: tr.nav_search, icon: <IconSearch />, section: tr.section_documents_ai },
    { id: '/ai/generate', label: tr.nav_ai_generate, icon: <IconSparkle />, section: tr.section_documents_ai, permission: 'useAiTools' },
    { id: '/ai/summary', label: tr.nav_ai_summary, icon: <IconReceipt />, section: tr.section_documents_ai, permission: 'useAiTools' },
    { id: '/ai/assistant', label: tr.nav_ai_assistant, icon: <IconBot />, section: tr.section_documents_ai, permission: 'useAiTools' },
    { id: '/contracts', label: tr.nav_contracts, icon: <IconScroll />, section: tr.section_billing, permission: 'viewPayments' },
    { id: '/correspondence', label: tr.nav_correspondence, icon: <IconMail />, section: tr.section_billing, permission: 'viewPayments' },
    { id: '/invoices', label: tr.nav_invoices, icon: <IconInvoice />, section: tr.section_billing, permission: 'viewPayments' },
    { id: '/payments', label: tr.nav_payments, icon: <IconCreditCard />, section: tr.section_billing, permission: 'viewPayments' },
    { id: '/reports', label: tr.nav_reports, icon: <IconBarChart />, section: tr.section_reporting, permission: 'viewPayments' },
    { id: '/members', label: tr.nav_members, icon: <IconTeam />, section: tr.section_firm, permission: 'manageUsers' },
    { id: '/members/audit', label: tr.nav_audit, icon: <IconClipboard />, section: tr.section_firm, permission: 'manageUsers' },
    { id: '/sessions', label: tr.nav_sessions, icon: <IconLock />, section: tr.section_account },
    { id: '/settings', label: tr.nav_settings, icon: <IconGear />, section: tr.section_account, permission: 'accessSettings' },
  ]
}

function buildBreadcrumbs(tr: Record<string, string>): Record<string, string[]> {
  return {
    '/dashboard': [tr.nav_dashboard],
    '/messages': [tr.nav_messages],
    '/clients': [tr.nav_clients],
    '/clients/add': [tr.nav_clients, tr.shell_new_client],
    '/cases': [tr.nav_cases],
    '/cases/add': [tr.nav_cases, tr.shell_new_case],
    '/hearings': [tr.nav_hearings],
    '/calendar': [tr.nav_calendar],
    '/documents': [tr.nav_documents],
    '/ocr': [tr.nav_ocr],
    '/search': [tr.nav_search],
    '/ai/generate': [tr.section_documents_ai, tr.shell_document_generation],
    '/ai/summary': [tr.section_documents_ai, tr.nav_ai_summary],
    '/ai/assistant': [tr.section_documents_ai, tr.nav_ai_assistant],
    '/contracts': [tr.nav_contracts],
    '/correspondence': [tr.nav_correspondence],
    '/invoices': [tr.nav_invoices],
    '/payments': [tr.nav_payments],
    '/reports': [tr.nav_reports],
    '/sessions': [tr.section_account, tr.nav_sessions],
    '/settings': [tr.section_account, tr.nav_settings],
    '/members': [tr.shell_firm_members],
    '/members/add': [tr.shell_firm_members, tr.shell_new_member],
    '/members/add/secretary': [tr.shell_firm_members, tr.shell_new_member, tr.shell_secretary],
    '/members/add/collaborator': [tr.shell_firm_members, tr.shell_new_member, tr.shell_collaborator],
    '/members/add/intern': [tr.shell_firm_members, tr.shell_new_member, tr.shell_intern],
    '/members/audit': [tr.section_firm, tr.nav_audit],
  }
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

function getBreadcrumb(pathname: string, clients: Client[], cases: Case[], tr: Record<string, string>): string[] {
  const breadcrumbs = buildBreadcrumbs(tr)
  if (breadcrumbs[pathname]) return breadcrumbs[pathname]
  if (MEMBER_PERMISSIONS_RE.test(pathname)) return [tr.shell_firm_members, tr.shell_permissions]
  if (MEMBER_PROFILE_RE.test(pathname)) return [tr.shell_firm_members, tr.shell_member_profile]
  const clientMatch = pathname.match(CLIENT_PROFILE_RE)
  if (clientMatch) {
    const client = clients.find((c) => c.id === clientMatch[1])
    return [tr.nav_clients, client?.name ?? tr.shell_client_file]
  }
  const caseMatch = pathname.match(CASE_DETAIL_RE)
  if (caseMatch) {
    const c = cases.find((x) => x.id === caseMatch[1])
    return [tr.nav_cases, c?.title ?? tr.shell_case_file]
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
  const { lang, setLang, tr, rtl } = useLang()
  const { toast } = useToast()
  const { clients, cases, members, appointmentRequests } = useAppData()
  const { currentUserId, setCurrentUserId, currentUserName, currentUserRoleLabel, currentUserInitials, hasPermission, realProfile, cabinetName, signOut } = useSession()
  const pendingRequestCount = appointmentRequests.filter((r) => r.status === 'pending').length
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const visibleNav = buildSidebarNav(tr).filter((n) => !n.permission || hasPermission(n.permission))
  const sections = Array.from(new Set(visibleNav.filter((n) => n.section).map((n) => n.section as string)))
  const breadcrumb = getBreadcrumb(pathname, clients, cases, tr)
  const backTarget = getBackTarget(pathname)

  const groupedNav = [
    { section: null, items: visibleNav.filter((n) => !n.section) },
    ...sections.map((sec) => ({ section: sec, items: visibleNav.filter((n) => n.section === sec) })),
  ]

  const viewAsOptions: { id: CurrentUserId; label: string }[] = [
    { id: 'self', label: realProfile ? `${tr.shell_maitre} ${realProfile.firstName} ${realProfile.lastName} (${ROLE_META[realProfile.role].label[lang]})` : tr.shell_me },
    ...members.map((m) => ({ id: m.id, label: `${m.firstName} ${m.lastName} (${ROLE_META[m.role].label[lang]})` })),
  ]

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
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
        className={`lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : (rtl ? 'translate-x-full' : '-translate-x-full')}`}
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--color-card)',
          borderRight: rtl ? 'none' : '1px solid var(--color-border)',
          borderLeft: rtl ? '1px solid var(--color-border)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: rtl ? 'auto' : 0,
          right: rtl ? 0 : 'auto',
          zIndex: 30,
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Logo size="sm" />
            <p style={{ margin: '6px 0 0', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', letterSpacing: '0.04em' }}>
              {cabinetName ?? tr.shell_my_firm}
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
                      textAlign: 'start',
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
                          marginInlineStart: 'auto',
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
                        <span style={{ marginInlineStart: 'auto', width: 4, height: 4, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
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
              title={tr.shell_view_as}
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
              title={tr.shell_logout}
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
              {tr.shell_logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className={rtl ? 'lg:mr-[220px]' : 'lg:ml-[220px]'} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
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
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: rtl ? 'scaleX(-1)' : 'none' }}>
                <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {tr.shell_back}
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
