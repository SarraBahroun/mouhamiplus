'use client'

import { Lang } from '@/lib/i18n'

export function LangSelector({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded" style={{ border: '1px solid var(--color-border)' }}>
      {(['fr', 'ar', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 8px',
            background: lang === l ? 'var(--color-primary)' : 'transparent',
            color: lang === l ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 2,
            transition: 'all 0.15s',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
