import type { Metadata } from 'next'
import { NotFoundContent } from '@/components/marketing/NotFoundContent'

export const metadata: Metadata = {
  title: 'Page introuvable — Mouhami+',
}

export default function NotFound() {
  return <NotFoundContent />
}
