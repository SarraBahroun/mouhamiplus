'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Lang, t } from '@/lib/i18n'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  tr: Record<string, string>
  rtl: boolean
}

const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = 'mouhamiplus_lang'

// Les avocats tunisiens travaillent principalement en arabe — c'est la langue par défaut,
// pas une simple option parmi d'autres.
const DEFAULT_LANG: Lang = 'ar'

function readStoredLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved === 'fr' || saved === 'ar' || saved === 'en' ? saved : DEFAULT_LANG
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    window.localStorage.setItem(STORAGE_KEY, l)
  }

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
