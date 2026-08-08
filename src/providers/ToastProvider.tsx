'use client'

import { createContext, useContext, useRef, useState } from 'react'

interface ToastContextValue {
  toast: string | null
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast(msg)
    timeoutRef.current = setTimeout(() => setToast(null), 3000)
  }

  return <ToastContext.Provider value={{ toast, showToast }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
