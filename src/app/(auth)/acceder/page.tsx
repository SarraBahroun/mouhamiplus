'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { useLang } from '@/providers/LangProvider'

export default function PortalChooserPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [hovered, setHovered] = useState<string | null>(null)

  const OPTIONS = [
    {
      id: 'cabinet',
      icon: (
        <svg width="30" height="30" viewBox="0 0 28 28" fill="currentColor">
          <rect x="3" y="12" width="22" height="14" rx="1" opacity="0.6" />
          <path d="M9 12V9a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9" />
          <rect x="12" y="18" width="4" height="8" rx="0.5" opacity="0.9" />
        </svg>
      ),
      title: tr.portal_cabinet_title,
      desc: tr.portal_cabinet_desc,
      href: '/login',
    },
    {
      id: 'client',
      icon: (
        <svg width="30" height="30" viewBox="0 0 28 28" fill="currentColor">
          <circle cx="14" cy="9" r="5" opacity="0.9" />
          <path d="M4 24c0-5.5 4.5-10 10-10s10 4.5 10 10" opacity="0.6" />
        </svg>
      ),
      title: tr.portal_client_title,
      desc: tr.portal_client_desc,
      href: '/espace-client/login',
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center flex flex-col gap-3 items-center">
        <Logo size="lg" />
        <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', margin: 0, maxWidth: 380 }}>
          {tr.tagline}. {tr.portal_choose_space}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        {OPTIONS.map((opt) => {
          const isHovered = hovered === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => router.push(opt.href)}
              onMouseEnter={() => setHovered(opt.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: 'var(--color-card)',
                border: `1.5px solid ${isHovered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 10,
                padding: '28px 22px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                boxShadow: isHovered
                  ? '0 12px 28px rgba(18,21,28,0.12)'
                  : '0 1px 3px rgba(18,21,28,0.06)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  background: isHovered ? 'var(--color-primary)' : 'rgba(22, 35, 63, 0.08)',
                  color: isHovered ? 'var(--color-primary-foreground)' : 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.18s ease, color 0.18s ease',
                }}
              >
                {opt.icon}
              </div>
              <div className="flex flex-col gap-1.5">
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-foreground)' }}>
                  {opt.title}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', lineHeight: 1.5 }}>{opt.desc}</span>
              </div>
              <span
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {tr.continue}
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ transform: isHovered ? 'translateX(2px)' : 'translateX(0)', transition: 'transform 0.18s ease' }}>
                  <path d="M5 3l4 4-4 4" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
