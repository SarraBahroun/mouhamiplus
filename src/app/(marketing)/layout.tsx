import { SplashScreen } from '@/components/ui/SplashScreen'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      {children}
    </>
  )
}
