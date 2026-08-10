// Référentiel des juridictions tunisiennes.
// Source : Ministère de la Justice (https://www.justice.gov.tn/index.php?id=255&L=3)
// et IEDJA (https://iedja.org/lorganisation-juridictionnelle-de-la-tunisie/).

export interface CourtOfAppealGroup {
  courtOfAppeal: string
  courts: string[]
}

export const COURTS_OF_APPEAL_GROUPS: CourtOfAppealGroup[] = [
  {
    courtOfAppeal: "Cour d'appel de Tunis",
    courts: [
      'Tribunal de première instance de Tunis',
      'Tribunal de première instance de Tunis 2',
      "Tribunal de première instance de l'Ariana",
      'Tribunal de première instance de Ben Arous',
      'Tribunal de première instance de Manouba',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel de Nabeul",
    courts: [
      'Tribunal de première instance de Grombalia',
      'Tribunal de première instance de Zaghouan',
      'Tribunal de première instance de Nabeul',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel de Bizerte",
    courts: [
      'Tribunal de première instance de Bizerte',
      'Tribunal de première instance de Béja',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel du Kef",
    courts: [
      'Tribunal de première instance du Kef',
      'Tribunal de première instance de Jendouba',
      'Tribunal de première instance de Siliana',
      'Tribunal de première instance du Kasserine',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel de Sousse",
    courts: [
      'Tribunal de première instance de Sousse',
      'Tribunal de première instance de Sousse 2',
      'Tribunal de première instance de Kairouan',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel de Monastir",
    courts: [
      'Tribunal de première instance de Monastir',
      'Tribunal de première instance de Mahdia',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel de Sfax",
    courts: [
      'Tribunal de première instance de Sfax',
      'Tribunal de première instance de Sfax 2',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel de Gafsa",
    courts: [
      'Tribunal de première instance de Gafsa',
      'Tribunal de première instance de Tozeur',
      'Tribunal de première instance de Sidi Bouzid',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel de Gabès",
    courts: [
      'Tribunal de première instance de Gabès',
      'Tribunal de première instance de Kébili',
    ],
  },
  {
    courtOfAppeal: "Cour d'appel de Médenine",
    courts: [
      'Tribunal de première instance de Médenine',
      'Tribunal de première instance de Tataouine',
    ],
  },
]

// Juridictions hors circonscription (pas rattachées à une cour d'appel spécifique dans le référentiel).
export const OTHER_COURTS: string[] = [
  'Cour de cassation',
  'Tribunal administratif',
  'Tribunal immobilier',
  "Centre d'arbitrage de Tunis",
]

export const ALL_TUNISIAN_COURTS: string[] = [
  ...COURTS_OF_APPEAL_GROUPS.flatMap((g) => g.courts),
  ...COURTS_OF_APPEAL_GROUPS.map((g) => g.courtOfAppeal),
  ...OTHER_COURTS,
]
