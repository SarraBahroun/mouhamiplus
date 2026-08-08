'use client'

export function Toggle({
  checked,
  onChange,
  disabled,
  size = 'md',
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  const width = size === 'md' ? 44 : 40
  const height = size === 'md' ? 24 : 22
  const knob = size === 'md' ? 16 : 16
  const pad = size === 'md' ? 4 : 3

  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width,
        height,
        borderRadius: height / 2,
        border: 'none',
        background: checked ? 'var(--color-primary)' : 'var(--color-border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: pad,
          left: checked ? width - knob - pad : pad,
          width: knob,
          height: knob,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}
