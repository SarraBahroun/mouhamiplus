'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ROLE_META, MemberRole } from '@/lib/members-data'
import { PermissionKey, ROLE_DEFAULT_PERMISSIONS } from '@/lib/permissions'
import { useAppData } from './AppDataProvider'
import { createClient } from '@/lib/supabase/client'

/** 'self' = l'utilisateur réellement authentifié. Un id membre = mode "voir en tant que" (démo/permissions). */
export type CurrentUserId = 'self' | string

interface RealProfile {
  id: string
  firstName: string
  lastName: string
  role: MemberRole
  email: string
  phone: string
}

interface SessionContextValue {
  loading: boolean
  realProfile: RealProfile | null
  cabinetId: string | null
  cabinetName: string | null
  cabinetAddress: string | null
  currentUserId: CurrentUserId
  setCurrentUserId: (id: CurrentUserId) => void
  currentUserName: string
  currentUserRoleLabel: string
  currentUserInitials: string
  hasPermission: (key: PermissionKey) => boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { members, memberPermissionOverrides } = useAppData()
  const [currentUserId, setCurrentUserId] = useState<CurrentUserId>('self')
  const [realProfile, setRealProfile] = useState<RealProfile | null>(null)
  const [cabinetId, setCabinetId] = useState<string | null>(null)
  const [cabinetName, setCabinetName] = useState<string | null>(null)
  const [cabinetAddress, setCabinetAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setRealProfile(null)
      setCabinetId(null)
      setCabinetName(null)
      setCabinetAddress(null)
      setLoading(false)
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, email, phone, cabinet_id, cabinets(name, address)')
      .eq('id', user.id)
      .single()
    if (profile) {
      setRealProfile({
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        email: profile.email,
        phone: profile.phone ?? '',
      })
      const cabinet = Array.isArray(profile.cabinets) ? profile.cabinets[0] : profile.cabinets
      setCabinetId(profile.cabinet_id ?? null)
      setCabinetName(cabinet?.name ?? null)
      setCabinetAddress(cabinet?.address ?? null)
    } else {
      setRealProfile(null)
      setCabinetId(null)
      setCabinetName(null)
      setCabinetAddress(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProfile()
    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setRealProfile(null)
        setCabinetId(null)
        setCabinetName(null)
        setCabinetAddress(null)
        return
      }
      loadProfile()
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const currentMember = currentUserId === 'self' ? null : members.find((m) => m.id === currentUserId) ?? null

  const currentUserName = currentUserId === 'self'
    ? (realProfile ? `Me. ${realProfile.firstName} ${realProfile.lastName}` : '')
    : `${currentMember?.firstName ?? ''} ${currentMember?.lastName ?? ''}`.trim()

  const currentUserRoleLabel = currentUserId === 'self'
    ? (realProfile ? ROLE_META[realProfile.role].label : '')
    : currentMember ? ROLE_META[currentMember.role].label : ''

  const currentUserInitials = currentUserId === 'self'
    ? (realProfile ? `${realProfile.firstName[0] ?? ''}${realProfile.lastName[0] ?? ''}`.toUpperCase() || '??' : '??')
    : currentMember?.avatar ?? '??'

  const hasPermission = (key: PermissionKey) => {
    if (currentUserId === 'self') {
      if (!realProfile) return false
      if (realProfile.role === 'owner') return true
      return ROLE_DEFAULT_PERMISSIONS[realProfile.role][key]
    }
    if (!currentMember) return false
    const set = memberPermissionOverrides[currentMember.id] ?? ROLE_DEFAULT_PERMISSIONS[currentMember.role]
    return set[key]
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setRealProfile(null)
    setCabinetId(null)
    setCabinetName(null)
    setCabinetAddress(null)
  }

  const value: SessionContextValue = {
    loading,
    realProfile,
    cabinetId,
    cabinetName,
    cabinetAddress,
    currentUserId,
    setCurrentUserId,
    currentUserName,
    currentUserRoleLabel,
    currentUserInitials,
    hasPermission,
    signOut,
    refreshProfile: loadProfile,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}
