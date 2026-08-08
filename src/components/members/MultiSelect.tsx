'use client'

import { useState } from 'react'

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
  const toggle = (o: string) =>
    onChange(selected.includes(o) ? selected.filter((s) => s !== o) : [...selected, o])

  return (
    <div className="flex flex-col gap-1.5" style={{ position: 'relative' }}>
      <label style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)' }}>{label}</label>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '8px 12px',
          border: `1.5px solid ${open ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius)',
          background: 'var(--color-card)',
          cursor: 'pointer',
          minHeight: 42,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          alignItems: 'center',
          boxShadow: open ? '0 0 0 3px rgba(22, 35, 63,0.12)' : 'none',
          transition: 'border-color 0.15s',
        }}
      >
        {selected.length === 0 ? (
          <span style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Sélectionner des dossiers…</span>
        ) : (
          selected.map((s) => (
            <span
              key={s}
              style={{
                fontSize: 11,
                padding: '2px 7px',
                background: 'var(--color-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 3,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {s.slice(0, 22)}…
              <span
                onClick={(e) => { e.stopPropagation(); toggle(s) }}
                style={{ cursor: 'pointer', color: 'var(--color-muted-foreground)', fontWeight: 700, lineHeight: 1 }}
              >
                ×
              </span>
            </span>
          ))
        )}
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(28,20,16,0.12)',
            zIndex: 50,
            maxHeight: 220,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-border)' }}>
            <input
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                background: 'transparent',
                color: 'var(--color-foreground)',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map((o) => (
              <div
                key={o}
                onClick={(e) => { e.stopPropagation(); toggle(o) }}
                style={{
                  padding: '8px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  background: selected.includes(o) ? 'rgba(22, 35, 63,0.04)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: `1.5px solid ${selected.includes(o) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 2,
                    background: selected.includes(o) ? 'var(--color-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {selected.includes(o) && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
                      <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                {o}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
