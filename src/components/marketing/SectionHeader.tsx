import { Reveal } from '@/components/ui/Reveal'
import { TYPE } from './theme'

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: TYPE.eyebrow,
        fontWeight: 500,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--color-sky)',
        opacity: 0.9,
      }}
    >
      {children}
    </span>
  )
}

/** En-tête de section réutilisable : œillet + titre + intro optionnelle, même échelle partout. */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = 'left',
  maxWidth,
  style,
}: {
  eyebrow: string
  title: string
  intro?: string
  align?: 'left' | 'center'
  maxWidth?: number
  style?: React.CSSProperties
}) {
  return (
    <Reveal className={align === 'center' ? 'text-center' : undefined} style={style}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: TYPE.heading,
          color: 'var(--color-ink)',
          margin: '10px 0 10px',
          textWrap: 'balance' as React.CSSProperties['textWrap'],
          maxWidth,
          marginLeft: align === 'center' && maxWidth ? 'auto' : undefined,
          marginRight: align === 'center' && maxWidth ? 'auto' : undefined,
        }}
      >
        {title}
      </h2>
      {intro && (
        <p style={{ fontSize: TYPE.intro, color: 'var(--color-muted-foreground)', margin: 0, maxWidth: maxWidth ?? 480, marginLeft: align === 'center' ? 'auto' : undefined, marginRight: align === 'center' ? 'auto' : undefined }}>
          {intro}
        </p>
      )}
    </Reveal>
  )
}

export { Eyebrow }
