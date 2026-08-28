'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LangSelector } from '@/components/ui/LangSelector'
import { useLang } from '@/providers/LangProvider'

/**
 * Menu burger visible uniquement sous le breakpoint sm. Il porte tout ce que la
 * nav masque sous sm : les ancres de section, le sélecteur de langue et les deux
 * actions « S'inscrire » / « Accéder » — côte à côte, ces éléments débordaient de
 * la largeur d'un téléphone.
 */
export function MobileNav() {
  const { tr, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Le menu porte désormais les actions principales du site : il doit se fermer
  // au clic à côté et à Échap, sinon il reste ouvert par-dessus la page.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Même ordre que les sections dans la page : pourquoi → abonnements → contact.
  const LINKS = [
    { href: '#pourquoi', label: tr.home_nav_why },
    { href: '#abonnements', label: tr.home_nav_plans },
    { href: '#contact', label: tr.home_nav_contact },
  ]

  const itemStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    padding: '10px 12px',
    borderRadius: 6,
  }

  return (
    <div ref={rootRef} className="sm:hidden" style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={open ? tr.mk_mobilenav_close : tr.mk_mobilenav_open}
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
            // `insetInlineEnd` et non `right` : le bouton est au bout de la barre,
            // donc à droite en français mais à gauche en arabe (la page entière
            // s'inverse en RTL). Aligner sur le bord *de fin* fait déployer le
            // panneau vers l'intérieur de l'écran dans les deux sens — un `right: 0`
            // le faisait sortir de l'écran en arabe.
            insetInlineEnd: 0,
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
              style={{ ...itemStyle, color: 'var(--color-sky-soft)' }}
            >
              {l.label}
            </a>
          ))}

          <div style={{ height: 1, background: 'rgba(251,243,229,0.14)', margin: '6px 4px' }} />

          <Link
            href="/register"
            onClick={() => setOpen(false)}
            style={{ ...itemStyle, color: 'var(--color-cream)' }}
          >
            {tr.register}
          </Link>
          <Link
            href="/acceder"
            onClick={() => setOpen(false)}
            style={{
              ...itemStyle,
              background: 'var(--color-cream)',
              color: 'var(--color-navy)',
              fontWeight: 600,
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            {tr.home_nav_enter}
          </Link>

          {/* Le menu reste ouvert au changement de langue : on voit la traduction
              s'appliquer sur place, et on peut corriger si on s'est trompé. */}
          <div style={{ height: 1, background: 'rgba(251,243,229,0.14)', margin: '6px 4px' }} />
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 2px' }}>
            <LangSelector lang={lang} setLang={setLang} variant="onDark" />
          </div>
        </div>
      )}
    </div>
  )
}
