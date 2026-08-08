'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppData } from '@/providers/AppDataProvider'
import { IconBell } from '@/components/ui/icons'

export function NotificationBell({ audience }: { audience: 'cabinet' | 'client' }) {
  const router = useRouter()
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData()
  const [open, setOpen] = useState(false)

  const items = notifications.filter((n) => n.audience === audience)
  const unreadCount = items.filter((n) => !n.read).length

  const openNotification = (id: string, href: string) => {
    markNotificationRead(id)
    setOpen(false)
    router.push(href)
  }

  return (
    <div style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-muted-foreground)',
          display: 'flex',
          alignItems: 'center',
          padding: 6,
          position: 'relative',
        }}
      >
        <IconBell size={17} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 14,
              height: 14,
              padding: '0 3px',
              borderRadius: 7,
              background: 'var(--color-error)',
              color: 'white',
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 320,
              maxWidth: '85vw',
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              boxShadow: '0 12px 28px rgba(18,21,28,0.15)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-foreground)' }}>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead(audience)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {items.length === 0 && (
                <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: 13, color: 'var(--color-muted-foreground)' }}>
                  Aucune notification
                </div>
              )}
              {items.map((n, i) => (
                <div
                  key={n.id}
                  onClick={() => openNotification(n.id, n.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '11px 14px',
                    cursor: 'pointer',
                    borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
                    background: n.read ? 'transparent' : 'rgba(22, 35, 63, 0.03)',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(22, 35, 63, 0.05)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(22, 35, 63, 0.03)')}
                >
                  {!n.read && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: 5 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: 'var(--color-foreground)', lineHeight: 1.4, fontWeight: n.read ? 400 : 500 }}>{n.text}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>{n.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
