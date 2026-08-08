'use client'

import { useState } from 'react'

export interface BtnProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

export function Btn({ children, onClick, variant = 'primary', disabled, fullWidth, type = 'button' }: BtnProps) {
  const [hover, setHover] = useState(false)
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 500,
    padding: '11px 20px',
    borderRadius: 'var(--radius)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.15s',
    letterSpacing: '0.01em',
    opacity: disabled ? 0.5 : 1,
  }
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: hover && !disabled ? 'var(--color-accent)' : 'var(--color-primary)',
      color: 'var(--color-primary-foreground)',
    },
    secondary: {
      background: hover && !disabled ? 'var(--color-muted)' : 'var(--color-secondary)',
      color: 'var(--color-secondary-foreground)',
      border: '1.5px solid var(--color-border)',
    },
    ghost: {
      background: 'transparent',
      color: hover && !disabled ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
      textDecoration: hover ? 'underline' : 'none',
    },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...styles[variant] }}
    >
      {children}
    </button>
  )
}
