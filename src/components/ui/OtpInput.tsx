'use client'

import { useRef } from 'react'

export function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = 6
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handleChange = (i: number, v: string) => {
    const cleaned = v.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(digits, ' ').split('')
    arr[i] = cleaned
    const next = arr.join('').replace(/ /g, '')
    onChange(next)
    if (cleaned && i < digits - 1) {
      refs.current[i + 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: digits }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          style={{
            width: 44,
            height: 52,
            textAlign: 'center',
            fontSize: 20,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            border: `1.5px solid ${value[i] ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
        />
      ))}
    </div>
  )
}
