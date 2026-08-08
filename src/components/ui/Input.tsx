'use client'

import { useState } from 'react'

export interface InputProps {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  hint?: string
  disabled?: boolean
  rtl?: boolean
}

export function Input({ label, type = 'text', value, onChange, error, placeholder, hint, disabled, rtl }: InputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        dir={rtl ? 'rtl' : 'ltr'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          padding: '10px 14px',
          border: `1.5px solid ${error ? 'var(--color-error)' : focused ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius)',
          background: disabled ? 'var(--color-muted)' : 'var(--color-card)',
          color: 'var(--color-foreground)',
          outline: 'none',
          width: '100%',
          boxShadow: focused ? `0 0 0 3px rgba(22, 35, 63, 0.12)` : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      />
      {(error || hint) && (
        <span
          style={{
            fontSize: 12,
            color: error ? 'var(--color-error)' : 'var(--color-muted-foreground)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {error || hint}
        </span>
      )}
    </div>
  )
}
