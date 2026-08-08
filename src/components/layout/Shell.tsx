'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { LangSelector } from '@/components/ui/LangSelector'
import { useLang } from '@/providers/LangProvider'

const AUTH_FLOW_BACK: Record<string, string> = {
  '/login': '/acceder',
  '/espace-client/login': '/acceder',
  '/2fa-verify': '/login',
  '/register': '/login',
  '/register/individual': '/register',
  '/register/individual/firm': '/register/individual',
  '/register/individual/team': '/register/individual/firm',
  '/register/cabinet': '/register',
  '/register/cabinet/team': '/register/cabinet',
  '/register/cabinet/invite': '/register/cabinet/team',
  '/register/plan': '/verify-email',
  '/register/payment': '/register/plan',
  '/2fa-setup': '/register',
  '/reset-password': '/login',
  '/reset-password/sent': '/reset-password',
  '/reset-password/new': '/reset-password/sent',
}

const SCREEN_STEPS: Record<string, [number, number]> = {
  '/register/individual': [1, 3],
  '/register/individual/firm': [2, 3],
  '/register/individual/team': [3, 3],
  '/register/cabinet': [1, 3],
  '/register/cabinet/team': [2, 3],
  '/register/cabinet/invite': [3, 3],
}

const WIDE_SCREENS = [
  '/register/individual',
  '/register/individual/firm',
  '/register/individual/team',
  '/register/cabinet',
  '/register/cabinet/team',
  '/register/cabinet/invite',
  '/register/payment',
]

const EXTRA_WIDE_SCREENS = ['/acceder', '/register/plan']

export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { lang, setLang, rtl } = useLang()

  const backTarget = AUTH_FLOW_BACK[pathname]
  const stepData = SCREEN_STEPS[pathname]
  const maxWidth = EXTRA_WIDE_SCREENS.includes(pathname) ? 680 : WIDE_SCREENS.includes(pathname) ? 520 : 420

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 20% 0%, rgba(22, 35, 63,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 100%, rgba(44, 74, 120,0.04) 0%, transparent 50%),
          var(--color-background)
        `,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(247, 247, 245,0.85)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-3">
          {backTarget && (
            <button
              onClick={() => router.push(backTarget)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted-foreground)',
                padding: 4,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d={rtl ? "M6 8l-4-4 1.4-1.4L9 8l-5.6 5.4L2 12l4-4z" : "M10 8l4-4-1.4-1.4L7 8l5.6 5.4L14 12l-4-4z"} opacity="0.7" />
                <path d={rtl ? "M3 8h10" : "M13 8H3"} stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
          )}
          <Logo size="sm" />
        </div>
        <LangSelector lang={lang} setLang={setLang} />
      </header>

      {/* Progress bar */}
      {stepData && (
        <div style={{ height: 2, background: 'var(--color-muted)' }}>
          <div
            style={{
              height: '100%',
              width: `${(stepData[0] / stepData[1]) * 100}%`,
              background: 'var(--color-primary)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}

      {/* Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth }}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        {['Conditions', 'Confidentialité', 'Support'].map((item) => (
          <button
            key={item}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              color: 'var(--color-muted-foreground)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {item}
          </button>
        ))}
      </footer>
    </div>
  )
}
