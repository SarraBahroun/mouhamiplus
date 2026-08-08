export type ClientType = 'individual' | 'company'

export interface Client {
  id: number
  name: string
  type: ClientType
  email: string
  phone: string
  address: string
  city: string
  createdAt: string
  lastActivity: string
}

export const initialClients: Client[] = [
  { id: 1, name: 'Karim Bensalem', type: 'individual', email: 'k.bensalem@email.tn', phone: '+216 98 123 456', address: '12 Rue de Marseille', city: 'Tunis', createdAt: '2022-01-15', lastActivity: 'il y a 2j' },
  { id: 2, name: 'Société TechTun', type: 'company', email: 'contact@techtun.tn', phone: '+216 71 456 789', address: 'Immeuble Alyssa, Centre Urbain Nord', city: 'Tunis', createdAt: '2021-11-03', lastActivity: 'il y a 2j' },
  { id: 3, name: 'Famille Mrad', type: 'individual', email: 'mrad.famille@email.tn', phone: '+216 22 987 654', address: '5 Avenue Habib Bourguiba', city: 'Sfax', createdAt: '2023-02-20', lastActivity: 'il y a 1 semaine' },
  { id: 4, name: 'Fedoua Gharbi', type: 'individual', email: 'f.gharbi@email.tn', phone: '+216 55 234 567', address: '8 Rue Ibn Khaldoun', city: 'Sousse', createdAt: '2023-06-10', lastActivity: 'il y a 3j' },
  { id: 5, name: 'Saïd & Associés SARL', type: 'company', email: 'contact@said-associes.tn', phone: '+216 73 345 678', address: 'Zone Industrielle', city: 'Monastir', createdAt: '2020-09-01', lastActivity: 'il y a 1 mois' },
  { id: 6, name: 'Compagnie Assur+', type: 'company', email: 'juridique@assurplus.tn', phone: '+216 71 998 877', address: 'Rue du Lac Léman, Les Berges du Lac', city: 'Tunis', createdAt: '2019-05-14', lastActivity: 'il y a 5j' },
]

export function getClientById(id: number): Client | undefined {
  return initialClients.find((c) => c.id === id)
}
