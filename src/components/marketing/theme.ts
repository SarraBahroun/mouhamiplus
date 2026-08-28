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
  // Le hero ne porte plus qu'une phrase courte : elle peut être nettement plus
  // grande sans encombrer, et c'est ce qui la rend lisible d'un coup d'œil.
  heroLead: 'clamp(17px, 2vw, 20px)',
  cardTitle: 19,
  stat: 22,
  heading: 'clamp(26px, 3.4vw, 34px)',
  hero: 'clamp(40px, 7.6vw, 82px)',
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
