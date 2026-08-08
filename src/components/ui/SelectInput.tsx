'use client'

import { useState } from 'react'

export interface SelectInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  rtl?: boolean
}

export function SelectInput({ label, value, onChange, options, rtl }: SelectInputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--color-foreground)',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={rtl ? 'rtl' : 'ltr'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          padding: '10px 14px',
          border: `1.5px solid ${focused ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius)',
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          outline: 'none',
          width: '100%',
          boxShadow: focused ? '0 0 0 3px rgba(22, 35, 63,0.12)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          appearance: 'none',
          cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
