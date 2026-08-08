import { createClient } from '@supabase/supabase-js'

/**
 * Client privilégié (service_role) — bypass RLS. Serveur uniquement (Server Actions),
 * jamais importé depuis un composant client. Utilisé pour le signup (création
 * cabinet + profil owner avant que auth_cabinet_id() ait une ligne profiles à lire).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
