'use client'

export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  hint?: string
}) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))

  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)' }}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <button
          onClick={dec}
          disabled={value <= min}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius)',
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            fontSize: 18,
            lineHeight: 1,
            cursor: value <= min ? 'not-allowed' : 'pointer',
            opacity: value <= min ? 0.4 : 1,
          }}
        >
          −
        </button>
        <span
          style={{
            minWidth: 32,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-foreground)',
          }}
        >
          {value}
        </span>
        <button
          onClick={inc}
          disabled={value >= max}
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius)',
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            fontSize: 18,
            lineHeight: 1,
            cursor: value >= max ? 'not-allowed' : 'pointer',
            opacity: value >= max ? 0.4 : 1,
          }}
        >
          +
        </button>
      </div>
      {hint && (
        <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{hint}</span>
      )}
    </div>
  )
}
