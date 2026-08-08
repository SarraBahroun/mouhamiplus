interface IconProps {
  size?: number
}

const base = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconHome({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M2 7.5L8 2l6 5.5" />
      <path d="M3.5 6.5V13a1 1 0 001 1H11.5a1 1 0 001-1V6.5" />
      <path d="M6.5 14V10h3v4" />
    </svg>
  )
}

export function IconChat({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M2 3.5h12v8H6.5L3 14.5V11.5H2z" />
    </svg>
  )
}

export function IconUsers({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <circle cx="6.2" cy="5.5" r="2.3" />
      <path d="M1.8 14c0-2.6 2-4.7 4.4-4.7s4.4 2.1 4.4 4.7" />
      <path d="M10.5 4.3c1.1.2 2 1.2 2 2.4s-.9 2.2-2 2.4" />
      <path d="M11.6 9.6c1.6.5 2.8 2.1 2.8 4" />
    </svg>
  )
}

export function IconFolder({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M1.8 4.2a1 1 0 011-1h3.3l1.2 1.5h5.9a1 1 0 011 1V12a1 1 0 01-1 1H2.8a1 1 0 01-1-1V4.2z" />
    </svg>
  )
}

export function IconScale({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M8 1.5v13" />
      <path d="M4 3.5h8" />
      <path d="M4 3.5L1.5 8a2.5 2.5 0 005 0L4 3.5z" />
      <path d="M12 3.5L9.5 8a2.5 2.5 0 005 0L12 3.5z" />
      <path d="M5.5 14.5h5" />
    </svg>
  )
}

export function IconCalendar({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="2" y="3" width="12" height="11" rx="1.2" />
      <path d="M2 6.3h12" />
      <path d="M5.3 1.7v2.6M10.7 1.7v2.6" />
    </svg>
  )
}

export function IconArchive({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="2" y="2.5" width="12" height="3" rx="0.8" />
      <path d="M2.8 5.5V12a1 1 0 001 1h8.4a1 1 0 001-1V5.5" />
      <path d="M6.3 8.3h3.4" />
    </svg>
  )
}

export function IconCamera({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M2 5.3a1 1 0 011-1h1.3l.8-1.3h5.8l.8 1.3H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V5.3z" />
      <circle cx="8" cy="8.5" r="2.3" />
    </svg>
  )
}

export function IconSearch({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13 13l-2.7-2.7" />
    </svg>
  )
}

export function IconSparkle({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M8 1.5l1.1 3.4L12.5 6l-3.4 1.1L8 10.5 6.9 7.1 3.5 6l3.4-1.1L8 1.5z" />
      <path d="M13 10l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6L13 10z" opacity="0.6" />
    </svg>
  )
}

export function IconReceipt({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M3.5 1.5h9v13l-1.8-1.2-1.7 1.2-1.7-1.2-1.8 1.2-1.7-1.2-1.8 1.2v-13z" opacity="0.9" />
      <path d="M5.5 5h5M5.5 7.5h5M5.5 10h3" />
    </svg>
  )
}

export function IconBot({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="3" y="5.5" width="10" height="7.5" rx="1.6" />
      <path d="M8 5.5V3" />
      <circle cx="8" cy="2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="5.8" cy="9" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="10.2" cy="9" r="0.9" fill="currentColor" stroke="none" />
      <path d="M6 11.3h4" />
    </svg>
  )
}

export function IconScroll({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M4.5 2h7v9.5a2 2 0 01-4 0V4a1.5 1.5 0 00-3 0v1" />
      <circle cx="4.5" cy="10.5" r="1.5" />
      <path d="M4.5 12V4" />
    </svg>
  )
}

export function IconMail({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="1.8" y="3.3" width="12.4" height="9.3" rx="1.2" />
      <path d="M2.3 4l5.7 4.5L13.7 4" />
    </svg>
  )
}

export function IconInvoice({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="2.5" y="1.8" width="11" height="12.4" rx="1" />
      <path d="M5 5h6M5 7.4h6M5 9.8h3.5" />
      <circle cx="10.8" cy="11.3" r="1.5" opacity="0.7" />
    </svg>
  )
}

export function IconCreditCard({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="1.8" y="3.5" width="12.4" height="9" rx="1.2" />
      <path d="M1.8 6.3h12.4" />
      <path d="M4 10.3h3" />
    </svg>
  )
}

export function IconBarChart({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M2 14V2" />
      <path d="M2 14h12" />
      <rect x="4" y="9" width="2" height="5" rx="0.4" fill="currentColor" stroke="none" opacity="0.8" />
      <rect x="7.3" y="6" width="2" height="8" rx="0.4" fill="currentColor" stroke="none" opacity="0.8" />
      <rect x="10.6" y="3.5" width="2" height="10.5" rx="0.4" fill="currentColor" stroke="none" opacity="0.8" />
    </svg>
  )
}

export function IconTeam({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <circle cx="5.2" cy="5" r="2" />
      <circle cx="10.8" cy="5" r="2" />
      <path d="M1.5 13.5c0-2.3 1.7-4.1 3.7-4.1s3.7 1.8 3.7 4.1" />
      <path d="M7.1 9.6c1.9.2 3.4 1.9 3.4 3.9" opacity="0.7" />
      <path d="M14.5 13.5c0-1.9-1.3-3.5-3-4" opacity="0.7" />
    </svg>
  )
}

export function IconClipboard({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="3" y="2.5" width="10" height="12" rx="1.2" />
      <rect x="5.5" y="1.3" width="5" height="2.4" rx="0.6" />
      <path d="M5.5 7.5h5M5.5 10h5M5.5 12.3h3" />
    </svg>
  )
}

export function IconLock({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="3" y="7.3" width="10" height="7" rx="1.2" />
      <path d="M5 7.3V5a3 3 0 016 0v2.3" />
      <circle cx="8" cy="10.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconGear({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <circle cx="8" cy="8" r="2.3" />
      <path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.3 3.7l-1.1 1.1M4.8 11.1l-1.1 1.1M12.3 12.3l-1.1-1.1M4.8 4.9L3.7 3.7" />
    </svg>
  )
}

export function IconCheck({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <circle cx="8" cy="8" r="6.3" />
      <path d="M5.3 8.2l1.9 1.9 3.5-3.9" />
    </svg>
  )
}

export function IconCash({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <rect x="1.5" y="4" width="13" height="8" rx="1.2" />
      <circle cx="8" cy="8" r="2" />
      <path d="M3.5 6v-.3a1.3 1.3 0 011.3-1.3M12.5 10v.3a1.3 1.3 0 01-1.3 1.3" opacity="0.6" />
    </svg>
  )
}

export function IconBell({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M4 6.5a4 4 0 018 0c0 3 1 4 1.3 4.5H2.7C3 10.5 4 9.5 4 6.5z" />
      <path d="M6.5 13.3a1.5 1.5 0 003 0" />
    </svg>
  )
}

export function IconMenu({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
    </svg>
  )
}

export function IconClose({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...base}>
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  )
}
