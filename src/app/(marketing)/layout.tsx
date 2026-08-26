'use client'

import { SplashScreen } from '@/components/ui/SplashScreen'
import { useLang } from '@/providers/LangProvider'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { rtl } = useLang()

  return (
    <div dir={rtl ? 'rtl' : 'ltr'}>
      <SplashScreen />
      {children}
    </div>
  )
}
