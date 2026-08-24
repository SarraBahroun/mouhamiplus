/**
 * Échelle typographique et d'espacement partagée par les sections de la page
 * marketing. Évite que chaque section invente ses propres tailles au pixel
 * près (11, 11.5, 12, 12.5, 13...) au fil des ajouts.
 */
export const TYPE = {
  eyebrow: 12,
  caption: 12.5,
  small: 13,
  body: 14,
  bodyStrong: 14.5,
  intro: 15,
  heroLead: 16.5,
  cardTitle: 19,
  stat: 22,
  heading: 'clamp(26px, 3.4vw, 34px)',
  hero: 'clamp(34px, 6vw, 64px)',
  statLarge: 32,
  statXL: 40,
} as const

export const SPACE = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 40,
  '2xl': 56,
  '3xl': 88,
} as const
