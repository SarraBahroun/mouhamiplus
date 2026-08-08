import { MemberStatus } from '@/lib/members-data'

export function StatusDot({ status }: { status: MemberStatus }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: status === 'active' ? '#27AE60' : '#BDC3C7',
          display: 'inline-block',
        }}
      />
      <span style={{ fontSize: 12, color: status === 'active' ? '#27AE60' : 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)' }}>
        {status === 'active' ? 'Actif' : 'Inactif'}
      </span>
    </span>
  )
}
