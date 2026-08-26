import { MemberRole, ROLE_META } from '@/lib/members-data'
import { useLang } from '@/providers/LangProvider'

export function RoleBadge({ role, size = 'sm' }: { role: MemberRole; size?: 'sm' | 'md' }) {
  const { lang } = useLang()
  const m = ROLE_META[role]
  return (
    <span
      style={{
        fontSize: size === 'md' ? 12 : 11,
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        padding: size === 'md' ? '3px 9px' : '2px 7px',
        background: m.bg,
        color: m.color,
        borderRadius: 3,
        whiteSpace: 'nowrap',
      }}
    >
      {m.label[lang]}
    </span>
  )
}
