import { Lang } from './i18n'

export type MemberRole = 'owner' | 'secretary' | 'collaborator' | 'intern'
export type MemberStatus = 'active' | 'inactive'

export const ROLE_META: Record<MemberRole, { label: Record<Lang, string>; color: string; bg: string; desc: Record<Lang, string> }> = {
  owner: {
    label: { fr: 'Avocat associé', ar: 'محامٍ شريك', en: 'Associate Lawyer' },
    color: '#12151C',
    bg: 'rgba(18,21,28,0.08)',
    desc: {
      fr: 'Accès complet au cabinet — finance, membres, paramètres et tous les dossiers.',
      ar: 'صلاحية كاملة على المكتب — المالية، الأعضاء، الإعدادات وجميع الملفات.',
      en: 'Full access to the firm — finance, members, settings and all cases.',
    },
  },
  secretary: {
    label: { fr: 'Secrétaire', ar: 'كاتبة ضبط', en: 'Secretary' },
    color: '#1565C0',
    bg: 'rgba(21,101,192,0.08)',
    desc: {
      fr: 'Gestion administrative, agenda et correspondances. Pas de finance ni IA.',
      ar: 'التصرف الإداري، جدول المواعيد والمراسلات. دون صلاحية المالية أو الذكاء الاصطناعي.',
      en: 'Administrative management, calendar and correspondence. No finance or AI access.',
    },
  },
  collaborator: {
    label: { fr: 'Collaborateur', ar: 'محامٍ متعاون', en: 'Associate' },
    color: '#2E7D32',
    bg: 'rgba(46,125,50,0.08)',
    desc: {
      fr: 'Accès aux dossiers partagés, rédaction et consultation. Finance optionnelle.',
      ar: 'صلاحية الاطلاع على الملفات المشتركة، التحرير والاستشارة. صلاحية المالية اختيارية.',
      en: 'Access to shared cases, drafting and consultation. Finance access optional.',
    },
  },
  intern: {
    label: { fr: 'Stagiaire', ar: 'متربص', en: 'Intern' },
    color: '#E65100',
    bg: 'rgba(230,81,0,0.08)',
    desc: {
      fr: 'Accès limité sous supervision obligatoire. Aucun accès finance ou IA.',
      ar: 'صلاحية محدودة تحت إشراف إلزامي. دون صلاحية المالية أو الذكاء الاصطناعي.',
      en: 'Limited access under mandatory supervision. No finance or AI access.',
    },
  },
}

// Taxonomie des domaines juridiques — utilisée à la fois pour le domaine d'un
// dossier (cases.practice_area, contrainte en base par un CHECK, voir
// supabase/migrations/0011_practice_area_taxonomy.sql) et les spécialités
// d'un collaborateur. Toute modification de cette liste doit être répercutée
// dans cette migration pour rester synchronisée.
export const SPECIALITIES = [
  'Droit civil',
  'Droit pénal',
  'Droit commercial et des affaires',
  'Droit des sociétés',
  'Droit du travail et sécurité sociale',
  'Statut personnel et succession',
  'Droit immobilier et foncier',
  'Droit administratif',
  'Droit fiscal',
  'Droit des assurances',
  'Droit bancaire',
  'Propriété intellectuelle',
  'Arbitrage et médiation',
  'Contentieux et recouvrement',
]

export const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
  MODIFICATION: { color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  AJOUT: { color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  EXPORT: { color: '#6A1B9A', bg: 'rgba(106,27,154,0.08)' },
  SUPPRESSION: { color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
  LECTURE: { color: '#37474F', bg: 'rgba(55,71,79,0.08)' },
}
