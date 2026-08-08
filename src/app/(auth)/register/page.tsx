'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { useLang } from '@/providers/LangProvider'

type ProfileKind = 'individual' | 'cabinet'

export default function ProfileSelectPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [selected, setSelected] = useState<ProfileKind | null>(null)

  const options: { id: ProfileKind; icon: React.ReactNode; label: string; desc: string; target: string }[] = [
    {
      id: 'individual',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
          <circle cx="14" cy="9" r="5" opacity="0.9" />
          <path d="M4 24c0-5.5 4.5-10 10-10s10 4.5 10 10" opacity="0.6" />
        </svg>
      ),
      label: tr.individual,
      desc: tr.individual_desc,
      target: '/register/individual',
    },
    {
      id: 'cabinet',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
          <rect x="3" y="12" width="22" height="14" rx="1" opacity="0.6" />
          <path d="M9 12V9a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9" />
          <rect x="12" y="18" width="4" height="8" rx="0.5" opacity="0.9" />
        </svg>
      ),
      label: tr.cabinet,
      desc: tr.cabinet_desc,
      target: '/register/cabinet',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, margin: '0 0 8px' }}>
          {tr.profile_title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', margin: 0 }}>{tr.profile_sub}</p>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            style={{
              background: selected === opt.id ? 'rgba(22, 35, 63,0.04)' : 'var(--color-card)',
              border: `2px solid ${selected === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 6,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              width: '100%',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 4,
                background: selected === opt.id ? 'rgba(22, 35, 63,0.08)' : 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              {opt.icon}
            </div>
            <div className="flex flex-col gap-0.5" style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-foreground)' }}>{opt.label}</span>
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{opt.desc}</span>
            </div>
            {selected === opt.id && (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="var(--color-primary)">
                <circle cx="9" cy="9" r="9" opacity="0.12" />
                <path d="M5 9l3 3 5-5" stroke="var(--color-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <Btn
        fullWidth
        disabled={!selected}
        onClick={() => selected && router.push(selected === 'individual' ? '/register/individual' : '/register/cabinet')}
      >
        {tr.continue}
      </Btn>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-muted-foreground)' }}>
        {tr.terms}
      </p>
    </div>
  )
}
