import { inviteMember, type InviteMemberInput } from '@/app/(app)/members/actions'
import type { InviteRow } from '@/components/onboarding/InviteList'

export async function sendInvites(rows: InviteRow[]): Promise<{ sent: number; failed: string[] }> {
  const valid = rows.filter((r) => r.name.trim() && r.email.trim())
  // Les stagiaires référencent le profil d'un autre associé/collaborateur invité dans
  // le même lot — celui-ci doit exister en base avant qu'on puisse le désigner comme
  // superviseur (contrainte de clé étrangère), donc on les crée d'abord.
  const nonInterns = valid.filter((r) => r.role !== 'intern')
  const interns = valid.filter((r) => r.role === 'intern')

  let sent = 0
  const failed: string[] = []
  const createdProfileIdByRowId = new Map<number, string>()

  for (const row of nonInterns) {
    const [firstName, ...rest] = row.name.trim().split(/\s+/)
    const result = await inviteMember({
      firstName,
      lastName: rest.join(' '),
      email: row.email.trim(),
      phone: '',
      role: row.role as InviteMemberInput['role'],
    })
    if ('error' in result) {
      failed.push(`${row.email} (${result.error})`)
    } else {
      sent += 1
      createdProfileIdByRowId.set(row.id, result.id)
    }
  }

  for (const row of interns) {
    let supervisorId: string | null = null
    if (row.supervisorRowId === 'self') {
      supervisorId = 'self'
    } else if (typeof row.supervisorRowId === 'number') {
      const resolved = createdProfileIdByRowId.get(row.supervisorRowId)
      if (!resolved) {
        failed.push(`${row.email} (superviseur introuvable — son invitation a peut-être échoué)`)
        continue
      }
      supervisorId = resolved
    } else {
      failed.push(`${row.email} (superviseur requis pour un stagiaire)`)
      continue
    }

    const [firstName, ...rest] = row.name.trim().split(/\s+/)
    const result = await inviteMember({
      firstName,
      lastName: rest.join(' '),
      email: row.email.trim(),
      phone: '',
      role: 'intern',
      supervisorId,
    })
    if ('error' in result) {
      failed.push(`${row.email} (${result.error})`)
    } else {
      sent += 1
    }
  }

  return { sent, failed }
}
