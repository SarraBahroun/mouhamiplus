'use client'

import { useState } from 'react'

const LINKS = [
  { href: '#pourquoi', label: 'Pourquoi Mouhami+' },
  { href: '#contact', label: 'Contact' },
  { href: '#abonnements', label: 'Abonnements' },
]

/** Menu burger visible uniquement sous le breakpoint sm — les liens de nav sont masqués (hidden sm:inline) sans remplacement en dessous. */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden" style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 8,
          margin: '-8px 0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="var(--color-cream)" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="var(--color-cream)" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 12,
            background: 'var(--color-navy-deep)',
            border: '1px solid rgba(251,243,229,0.14)',
            borderRadius: 10,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 200,
            zIndex: 20,
            boxShadow: '0 16px 40px rgba(6,13,28,0.5)',
          }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                color: 'var(--color-sky-soft)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                padding: '10px 12px',
                borderRadius: 6,
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
