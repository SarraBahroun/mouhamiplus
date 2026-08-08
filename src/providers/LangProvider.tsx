'use client'

import { createContext, useContext, useState } from 'react'
import { Lang, t } from '@/lib/i18n'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  tr: Record<string, string>
  rtl: boolean
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')

  const value: LangContextValue = {
    lang,
    setLang,
    tr: t[lang],
    rtl: lang === 'ar',
  }

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within a LangProvider')
  return ctx
}
