'use client'

import { useRouter } from 'next/navigation'
import { useAppData } from '@/providers/AppDataProvider'
import { useLang } from '@/providers/LangProvider'

const LOCALE: Record<string, string> = { fr: 'fr-FR', ar: 'ar-TN', en: 'en-US' }

export default function HearingsPage() {
  const router = useRouter()
  const { tr, lang } = useLang()
  const locale = LOCALE[lang]
  const { cases, clients } = useAppData()

  const hearings = cases
    .flatMap((c) => c.hearings.map((h) => ({ ...h, case: c })))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  const now = new Date()
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcoming = hearings.filter((h) => new Date(h.date) >= now)
  const thisWeek = upcoming.filter((h) => new Date(h.date) <= inSevenDays)
  const courtsCount = new Set(hearings.map((h) => h.court)).size

  const courtCounts = hearings.reduce<Record<string, number>>((acc, h) => {
    const court = h.court || tr.hearings_court_unknown
    acc[court] = (acc[court] ?? 0) + 1
    return acc
  }, {})
  const byCourt = Object.entries(courtCounts).sort((a, b) => b[1] - a[1])
  const maxCourtCount = Math.max(1, ...byCourt.map(([, n]) => n))

  const stats = [
    { label: tr.hearings_stat_total_label, value: String(hearings.length), sub: tr.hearings_stat_total_sub, icon: '⚖️' },
    {
      label: tr.hearings_stat_upcoming_label,
      value: String(upcoming.length),
      sub: upcoming[0] ? tr.hearings_stat_next.replace('{date}', new Date(upcoming[0].date).toLocaleDateString(locale)) : tr.hearings_stat_none_scheduled,
      icon: '📅',
    },
    { label: tr.common_this_week, value: String(thisWeek.length), sub: tr.hearings_stat_week_sub, icon: '🗓️' },
    { label: tr.hearings_stat_courts_label, value: String(courtsCount), sub: tr.hearings_stat_courts_sub, icon: '🏛️' },
  ]

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.nav_hearings}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {tr.hearings_total_count.replace('{n}', String(hearings.length))}
          </p>
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

        {hearings.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: 14, border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-card)' }}>
            {tr.hearings_empty}
          </div>
        )}

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          {hearings.map((h, i) => (
            <div
              key={`${h.case.id}-${h.id}`}
              onClick={() => router.push(`/cases/${h.case.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '13px 16px',
                borderBottom: i < hearings.length - 1 ? '1px solid var(--color-border)' : 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63,0.02)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div style={{ width: 48, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>
                  {new Date(h.date).toLocaleDateString(locale, { day: '2-digit' })}
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>
                  {new Date(h.date).toLocaleDateString(locale, { month: 'short' })}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{h.note}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{h.case.title} · {clients.find((cl) => cl.id === h.case.clientId)?.name}</div>
              </div>
              <div style={{ textAlign: 'end', flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)' }}>
                  {new Date(h.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>{h.court}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Répartition par tribunal */}
        {byCourt.length > 0 && (
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
              {tr.hearings_by_court_title}
            </h2>
            <div className="flex flex-col gap-3">
              {byCourt.map(([court, count]) => (
                <div key={court}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-foreground)' }}>{court}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{count}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--color-secondary)', overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxCourtCount) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
