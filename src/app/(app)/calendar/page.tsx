'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppData } from '@/providers/AppDataProvider'

const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

const MONTH_LABEL = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

export default function CalendarPage() {
  const router = useRouter()
  const { cases } = useAppData()

  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const goToMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const events: Record<number, { label: string; caseId: string; kind: 'hearing' | 'task' }[]> = {}
  for (const c of cases) {
    for (const h of c.hearings) {
      const d = new Date(h.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        events[day] = [...(events[day] ?? []), { label: `Audience — ${c.title}`, caseId: c.id, kind: 'hearing' }]
      }
    }
    for (const t of c.tasks) {
      const d = new Date(t.dueDate)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        events[day] = [...(events[day] ?? []), { label: t.label, caseId: c.id, kind: 'task' }]
      }
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Calendrier</h1>
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0, textTransform: 'capitalize' }}>
              {MONTH_LABEL.format(new Date(year, month, 1))}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToMonth(-1)}
              aria-label="Mois précédent"
              style={{ width: 30, height: 30, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-card)', cursor: 'pointer' }}
            >
              ‹
            </button>
            <button
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
              style={{ padding: '0 12px', height: 30, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-card)', cursor: 'pointer', fontSize: 12 }}
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => goToMonth(1)}
              aria-label="Mois suivant"
              style={{ width: 30, height: 30, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-card)', cursor: 'pointer' }}
            >
              ›
            </button>
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--color-secondary)' }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-muted-foreground)' }}>
                {w}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, i) => {
              const dayEvents = day ? events[day] ?? [] : []
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              return (
                <div
                  key={i}
                  style={{
                    minHeight: 82,
                    padding: '6px 6px',
                    border: '1px solid var(--color-border)',
                    background: isToday ? 'rgba(22, 35, 63,0.04)' : 'var(--color-card)',
                  }}
                >
                  {day && (
                    <>
                      <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
                        {day}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {dayEvents.slice(0, 2).map((e, j) => (
                          <div
                            key={j}
                            onClick={() => router.push(`/cases/${e.caseId}`)}
                            style={{
                              fontSize: 10,
                              padding: '2px 4px',
                              borderRadius: 2,
                              cursor: 'pointer',
                              background: e.kind === 'hearing' ? 'rgba(22, 35, 63,0.1)' : 'rgba(21,101,192,0.1)',
                              color: e.kind === 'hearing' ? 'var(--color-primary)' : '#1565C0',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {e.label}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div style={{ fontSize: 10, color: 'var(--color-muted-foreground)' }}>+{dayEvents.length - 2} autres</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
