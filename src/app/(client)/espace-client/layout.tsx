import { ClientShell } from '@/components/layout/ClientShell'
import { ClientSessionProvider } from '@/providers/ClientSessionProvider'

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientSessionProvider>
      <ClientShell>{children}</ClientShell>
    </ClientSessionProvider>
  )
}
