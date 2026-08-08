export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }
  return (
    <div className={`flex items-center gap-2 ${sizes[size]}`}>
      <div
        style={{
          width: size === 'lg' ? 36 : size === 'md' ? 30 : 24,
          height: size === 'lg' ? 36 : size === 'md' ? 30 : 24,
          background: 'var(--color-primary)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={size === 'lg' ? 20 : size === 'md' ? 16 : 13}
          height={size === 'lg' ? 20 : size === 'md' ? 16 : 13}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M10 2L3 7v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V7L10 2z"
            fill="var(--color-primary-foreground)"
            opacity="0.9"
          />
          <rect x="8" y="4" width="4" height="3" rx="0.5" fill="var(--color-primary-foreground)" opacity="0.6" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          color: 'var(--color-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        Mouhami<span style={{ color: 'var(--color-accent)' }}>+</span>
      </span>
    </div>
  )
}
