export type Lang = 'fr' | 'ar' | 'en'
export type Dict = Record<string, string>

import { authDict } from './i18n/auth'
import { commonDict } from './i18n/common'
import { shellDict } from './i18n/shell'
import { agendaDict } from './i18n/agenda'
import { aiDict } from './i18n/ai'
import { billingDict } from './i18n/billing'
import { clientPortalDict } from './i18n/client-portal'
import { clientsDict } from './i18n/clients'
import { dashboardDict } from './i18n/dashboard'
import { documentsDict } from './i18n/documents'
import { legalDict } from './i18n/legal'
import { marketingDict } from './i18n/marketing'
import { membersFormsDict } from './i18n/members-forms'
import { registerExtraDict } from './i18n/register-extra'
import { settingsDict } from './i18n/settings'

const LANGS: Lang[] = ['fr', 'ar', 'en']

function mergeDicts(...dicts: Record<Lang, Dict>[]): Record<Lang, Dict> {
  const result: Record<Lang, Dict> = { fr: {}, ar: {}, en: {} }
  for (const dict of dicts) {
    for (const lang of LANGS) Object.assign(result[lang], dict[lang])
  }
  return result
}

// Chaque domaine fonctionnel de l'app a son propre fichier sous src/lib/i18n/ (une
// paire {fr, ar, en} par fichier), fusionné ici en un seul dictionnaire plat. Les clés
// des nouveaux domaines doivent être préfixées (ex. `cases_title`) pour éviter les
// collisions — seul `auth.ts` garde ses clés historiques non préfixées.
export const t: Record<Lang, Dict> = mergeDicts(
  authDict,
  commonDict,
  shellDict,
  agendaDict,
  aiDict,
  billingDict,
  clientPortalDict,
  clientsDict,
  dashboardDict,
  documentsDict,
  legalDict,
  marketingDict,
  membersFormsDict,
  registerExtraDict,
  settingsDict
)
