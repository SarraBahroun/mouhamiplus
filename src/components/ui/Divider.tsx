export function Divider({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      {text && (
        <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
          {text}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  )
}
