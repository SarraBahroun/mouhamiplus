'use client'

import { useEffect } from 'react'

/**
 * Le scroll natif vers une ancre (#hash) peut être "corrigé" par le navigateur
 * si la mise en page bouge juste après (police web qui charge, animation qui
 * termine), ce qui donne l'impression que la page "remonte" toute seule après
 * un clic sur Contact / Abonnements. On pilote le scroll nous-mêmes une fois
 * la page stable pour que ça n'arrive plus.
 */
export function SmoothAnchorLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!target) return
      const id = target.getAttribute('href')?.slice(1)
      if (!id) return
      const el = document.getElementById(id)
      if (!el) return
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
