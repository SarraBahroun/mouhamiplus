'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppData } from '@/providers/AppDataProvider'

interface SearchResult {
  type: 'Dossier' | 'Client' | 'Document'
  icon: string
  title: string
  sub: string
  href: string
}

export default function SearchPage() {
  const router = useRouter()
  const { cases, clients } = useAppData()
  const [query, setQuery] = useState('')

  const results: SearchResult[] = [
    ...cases.map((c): SearchResult => ({
      type: 'Dossier',
      icon: '📁',
      title: c.title,
      sub: `Réf. ${c.reference} · ${c.practiceArea || 'Domaine non précisé'}`,
      href: `/cases/${c.id}`,
    })),
    ...clients.map((c): SearchResult => ({
      type: 'Client',
      icon: c.type === 'company' ? '🏢' : '🧑‍💼',
      title: c.name,
      sub: `${c.type === 'company' ? 'Entreprise' : 'Particulier'} · ${c.city || 'Ville non précisée'}`,
      href: `/clients/${c.id}`,
    })),
    ...cases.flatMap((c) => c.documents.map((d): SearchResult => ({
      type: 'Document',
      icon: '📄',
      title: d.name,
      sub: c.title,
      href: `/cases/${c.id}`,
    }))),
  ]

  const filtered = query
    ? results.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.sub.toLowerCase().includes(query.toLowerCase()))
    : results

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Recherche</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Recherchez à travers vos dossiers, clients et documents
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="var(--color-muted-foreground)"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M12 12l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un dossier, un client, un document…"
            autoFocus
            style={{
              width: '100%',
              padding: '13px 14px 13px 38px',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              background: 'var(--color-card)',
              outline: 'none',
              color: 'var(--color-foreground)',
            }}
          />
        </div>

        <div>
          <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', margin: '0 0 8px' }}>
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}{query ? ` pour "${query}"` : ''}
          </p>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>Aucun résultat</div>
            )}
            {filtered.map((r, i) => (
              <div
                key={`${r.type}-${r.title}-${i}`}
                onClick={() => router.push(r.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63,0.02)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: 'var(--color-foreground)' }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{r.sub}</div>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '2px 7px', background: 'var(--color-secondary)', borderRadius: 3, color: 'var(--color-muted-foreground)' }}>
                  {r.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
