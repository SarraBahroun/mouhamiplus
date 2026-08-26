'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { Avatar } from '@/components/members/Avatar'
import { ClientType } from '@/lib/clients-data'
import { useAppData } from '@/providers/AppDataProvider'
import { useLang } from '@/providers/LangProvider'

function initialsOf(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const LOCALE: Record<string, string> = { fr: 'fr-FR', ar: 'ar-TN', en: 'en-US' }

export default function ClientsPage() {
  const router = useRouter()
  const { tr, lang } = useLang()
  const locale = LOCALE[lang]
  const TYPE_LABEL: Record<ClientType, string> = { individual: tr.clients_type_individual, company: tr.clients_type_company }
  const { clients, cases } = useAppData()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ClientType | 'all'>('all')

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || c.type === typeFilter
    return matchSearch && matchType
  })

  const individualCount = clients.filter((c) => c.type === 'individual').length
  const companyCount = clients.filter((c) => c.type === 'company').length
  const portalCount = clients.filter((c) => c.hasPortalAccess).length

  const cityCounts = clients.reduce<Record<string, number>>((acc, c) => {
    const city = c.city || tr.clients_city_unknown
    acc[city] = (acc[city] ?? 0) + 1
    return acc
  }, {})
  const byCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxCityCount = Math.max(1, ...byCity.map(([, n]) => n))

  const recentClients = [...clients]
    .sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1))
    .slice(0, 5)

  const stats = [
    {
      label: tr.clients_stat_total_label,
      value: String(clients.length),
      sub: tr.clients_stat_total_sub.replace('{individual}', String(individualCount)).replace('{company}', String(companyCount)),
      icon: '👥',
    },
    { label: tr.clients_stat_individuals_label, value: String(individualCount), sub: tr.clients_stat_individuals_sub, icon: '🧑' },
    { label: tr.clients_stat_companies_label, value: String(companyCount), sub: tr.clients_stat_companies_sub, icon: '🏢' },
    { label: tr.clients_stat_portal_label, value: String(portalCount), sub: tr.clients_stat_portal_sub.replace('{n}', String(clients.length)), icon: '🔐' },
  ]

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
              {tr.clients_title}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
              {tr.clients_total_count.replace('{n}', String(clients.length))}
            </p>
          </div>
          <Btn onClick={() => router.push('/clients/add')}>{tr.clients_add_button}</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '14px 16px', boxShadow: '0 1px 3px rgba(28,20,16,0.04)' }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-foreground)', marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex gap-3">
          <div style={{ flex: 1, position: 'relative' }}>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="var(--color-muted-foreground)"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr.clients_search_placeholder}
              style={{
                width: '100%',
                padding: '9px 12px 9px 30px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                background: 'var(--color-card)',
                outline: 'none',
                color: 'var(--color-foreground)',
              }}
            />
          </div>
          <div className="flex gap-1" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius)', padding: 3, border: '1px solid var(--color-border)' }}>
            {(['all', 'individual', 'company'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '5px 10px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: typeFilter === t ? 'var(--color-card)' : 'transparent',
                  color: typeFilter === t ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  fontWeight: typeFilter === t ? 600 : 400,
                  boxShadow: typeFilter === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                {t === 'all' ? tr.common_all : TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflowX: 'auto', background: 'var(--color-card)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1.5fr 90px 100px',
              minWidth: 640,
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-secondary)',
            }}
          >
            {[tr.clients_col_client, tr.clients_col_type, tr.clients_col_contact, tr.nav_cases, tr.clients_col_last_activity].map((h) => (
              <span key={h} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {h}
              </span>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14 }}>
              {tr.clients_empty_search}
            </div>
          )}
          {filtered.map((c, i) => (
            <div
              key={c.id}
              onClick={() => router.push(`/clients/${c.id}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 1fr 1.5fr 90px 100px',
                minWidth: 640,
                padding: '12px 16px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63,0.02)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div className="flex items-center gap-3">
                <Avatar initials={initialsOf(c.name)} size={34} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{c.city}</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 7px',
                  background: c.type === 'company' ? 'rgba(21,101,192,0.08)' : 'rgba(22, 35, 63,0.08)',
                  color: c.type === 'company' ? '#1565C0' : 'var(--color-primary)',
                  borderRadius: 3,
                  width: 'fit-content',
                }}
              >
                {TYPE_LABEL[c.type]}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>{c.phone}</div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                {cases.filter((k) => k.clientId === c.id).length}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{new Date(c.lastActivity).toLocaleDateString(locale)}</span>
            </div>
          ))}
        </div>

        {/* Répartition + clients récents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
              {tr.clients_by_city_title}
            </h2>
            {byCity.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{tr.common_no_data}</p>
            )}
            <div className="flex flex-col gap-3">
              {byCity.map(([city, count]) => (
                <div key={city}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{city}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{count}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--color-secondary)', overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxCityCount) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
              {tr.clients_recent_title}
            </h2>
            {recentClients.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{tr.clients_no_recent}</p>
            )}
            <div className="flex flex-col gap-0">
              {recentClients.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => router.push(`/clients/${c.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 0',
                    cursor: 'pointer',
                    borderBottom: i < recentClients.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <Avatar initials={initialsOf(c.name)} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{TYPE_LABEL[c.type]}</div>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {new Date(c.lastActivity).toLocaleDateString(locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
