export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        padding: '32px 28px',
        boxShadow: '0 1px 3px rgba(28,20,16,0.06), 0 4px 16px rgba(28,20,16,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
