import Link from 'next/link'

export function LegalPageShell({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div style={{ background: '#FFFCF6', minHeight: '100vh' }}>
      <div
        style={{
          background: 'linear-gradient(160deg, var(--color-navy) 0%, var(--color-navy-deep) 100%)',
          padding: '20px 24px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div
              style={{
                width: 26,
                height: 26,
                background: 'var(--color-cream)',
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7L10 2z" fill="var(--color-navy)" opacity="0.95" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-cream)', fontSize: 15 }}>
              Mouhami<span style={{ color: 'var(--color-sky)' }}>+</span>
            </span>
          </Link>
          <Link href="/" style={{ fontSize: 13, color: 'var(--color-sky-soft)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 96px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, color: 'var(--color-navy)', margin: '0 0 8px' }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: '#5C6472', margin: '0 0 40px' }}>Dernière mise à jour : {updated}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>{children}</div>
      </main>

      <footer style={{ background: 'var(--color-navy-deep)', padding: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: 'rgba(169,214,242,0.5)' }}>© 2026 Mouhami+. Tous droits réservés.</span>
      </footer>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-navy)', margin: '0 0 10px' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: '#2A2E38', display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </section>
  )
}
