'use client'

import { useMemo, useRef, useState } from 'react'
import { IconSearch } from './icons'

export interface SearchSelectOption {
  value: string
  label: string
}

export interface SearchSelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: SearchSelectOption[]
  placeholder?: string
  error?: string
  rtl?: boolean
}

export function SearchSelect({ label, value, onChange, options, placeholder, error, rtl }: SearchSelectProps) {
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const closeDropdown = () => {
    setOpen(false)
    setFocused(false)
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef} style={{ position: 'relative' }}>
      <label
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 500,
          color: error ? 'var(--color-error)' : 'var(--color-foreground)',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={open ? query : selected?.label ?? ''}
          placeholder={placeholder ?? '— Rechercher —'}
          dir={rtl ? 'rtl' : 'ltr'}
          onFocus={() => {
            setFocused(true)
            setOpen(true)
            setQuery('')
          }}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => {
            // Delay so a click on an option registers before the list unmounts.
            setTimeout(closeDropdown, 120)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            padding: rtl ? '10px 14px 10px 36px' : '10px 36px 10px 14px',
            border: `1.5px solid ${error ? 'var(--color-error)' : focused ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            outline: 'none',
            width: '100%',
            boxShadow: focused ? '0 0 0 3px rgba(22, 35, 63,0.12)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '50%',
            [rtl ? 'left' : 'right']: 12,
            transform: 'translateY(-50%)',
            color: 'var(--color-muted-foreground)',
            pointerEvents: 'none',
            display: 'flex',
          }}
        >
          <IconSearch size={14} />
        </span>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              maxHeight: 220,
              overflowY: 'auto',
              background: 'var(--color-card)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 30,
            }}
          >
            {filtered.length === 0 && (
              <div style={{ padding: '10px 14px', fontSize: 14, color: 'var(--color-muted-foreground)' }}>
                Aucun résultat
              </div>
            )}
            {filtered.map((o) => (
              <div
                key={o.value}
                // onMouseDown fires before the input's onBlur, so the click is not lost.
                onMouseDown={(e) => {
                  e.preventDefault()
                  onChange(o.value)
                  closeDropdown()
                }}
                style={{
                  padding: '10px 14px',
                  fontSize: 14,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  color: 'var(--color-foreground)',
                  background: o.value === value ? 'var(--color-muted)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-muted)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = o.value === value ? 'var(--color-muted)' : 'transparent'
                }}
              >
                {o.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <span style={{ fontSize: 12, color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}>{error}</span>
      )}
    </div>
  )
}
