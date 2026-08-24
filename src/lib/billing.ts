export interface Plan {
  id: string
  name: string
  price: number | null
  priceLabel: string
  tagline: string
  features: string[]
  /** Nombre maximum de membres du cabinet (dont l'avocat associé). null = illimité. */
  maxUsers: number | null
}

export const PLANS: Plan[] = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 89,
    priceLabel: '89 TND / mois',
    tagline: 'Pour l’avocat indépendant',
    features: ['Dossiers & clients illimités', 'Espace client inclus', 'Agenda & rappels d’audience', '1 utilisateur'],
    maxUsers: 1,
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    price: 249,
    priceLabel: '249 TND / mois',
    tagline: 'Le plus populaire',
    features: ['Tout Essentiel, plus :', 'Jusqu’à 10 collaborateurs', 'Facturation & paiements', 'Permissions par rôle'],
    maxUsers: 10,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: null,
    priceLabel: 'Sur devis',
    tagline: 'Cabinets multi-bureaux',
    features: ['Utilisateurs illimités', 'Accès API & intégrations', 'Audit & conformité avancés', 'Support dédié'],
    maxUsers: null,
  },
]

export function planById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}

// TODO(admin): remplacer par le vrai RIB du cabinet Mouhami+ avant mise en production.
export const BANK_TRANSFER_INFO = {
  bankName: 'À compléter (ex. Banque de Tunisie)',
  accountHolder: 'À compléter (raison sociale)',
  rib: 'À compléter — 20 chiffres',
}
