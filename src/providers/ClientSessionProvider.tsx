'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ClientProfile {
  id: string
  name: string
  email: string
  type: 'individual' | 'company'
}

interface ClientSessionContextValue {
  loading: boolean
  clientProfile: ClientProfile | null
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const ClientSessionContext = createContext<ClientSessionContextValue | null>(null)

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setClientProfile(null)
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('clients')
      .select('id, name, email, type')
      .eq('auth_user_id', user.id)
      .single()
    setClientProfile(data ? { id: data.id, name: data.name, email: data.email, type: data.type } : null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setClientProfile(null)
        return
      }
      load()
    })
    return () => sub.subscription.unsubscribe()
  }, [load])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setClientProfile(null)
  }

  return (
    <ClientSessionContext.Provider value={{ loading, clientProfile, signOut, refresh: load }}>
      {children}
    </ClientSessionContext.Provider>
  )
}

export function useClientSession() {
  const ctx = useContext(ClientSessionContext)
  if (!ctx) throw new Error('useClientSession must be used within a ClientSessionProvider')
  return ctx
}
