export function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.33,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        flexShrink: 0,
        letterSpacing: '0.03em',
      }}
    >
      {initials}
    </div>
  )
}
