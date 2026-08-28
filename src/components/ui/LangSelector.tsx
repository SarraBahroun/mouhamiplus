'use client'

import { Lang } from '@/lib/i18n'

/**
 * `variant` : `default` pour les fonds clairs de l'app, `onDark` pour la barre
 * navy du site public — les couleurs de thème (primary / muted-foreground) y
 * seraient illisibles.
 */
export function LangSelector({
  lang,
  setLang,
  variant = 'default',
}: {
  lang: Lang
  setLang: (l: Lang) => void
  variant?: 'default' | 'onDark'
}) {
  const onDark = variant === 'onDark'
  return (
    <div
      className="flex items-center gap-0.5 rounded"
      style={{ border: `1px solid ${onDark ? 'rgba(251,243,229,0.24)' : 'var(--color-border)'}` }}
    >
      {(['fr', 'ar', 'en'] as Lang[]).map((l) => {
        const active = lang === l
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 500,
              padding: '4px 8px',
              background: active ? (onDark ? 'var(--color-cream)' : 'var(--color-primary)') : 'transparent',
              color: active
                ? onDark
                  ? 'var(--color-navy)'
                  : 'var(--color-primary-foreground)'
                : onDark
                  ? 'var(--color-sky-soft)'
                  : 'var(--color-muted-foreground)',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.15s',
            }}
          >
            {l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
