import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Préfixes du groupe de routes (app) — cabinet authentifié uniquement. */
const PROTECTED_PREFIXES = [
  '/dashboard', '/messages', '/clients', '/cases', '/hearings', '/calendar',
  '/documents', '/ocr', '/search', '/ai', '/contracts', '/correspondence',
  '/invoices', '/payments', '/reports', '/members', '/sessions', '/settings',
]

/** Portail client — tout /espace-client/* sauf la page de connexion elle-même. */
const CLIENT_PORTAL_PREFIX = '/espace-client'
const CLIENT_LOGIN_PATH = '/espace-client/login'

/** Rafraîchit la session Supabase à chaque requête — appelé depuis src/proxy.ts */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // IMPORTANT: ne rien exécuter entre createServerClient et getUser — cela invaliderait le rafraîchissement du token.
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const isClientPortal = pathname !== CLIENT_LOGIN_PATH && (pathname === CLIENT_PORTAL_PREFIX || pathname.startsWith(CLIENT_PORTAL_PREFIX + '/'))
  if (isClientPortal && !user) {
    const url = request.nextUrl.clone()
    url.pathname = CLIENT_LOGIN_PATH
    return NextResponse.redirect(url)
  }

  // Un membre avec 2FA activée doit avoir complété la vérification (aal2) avant
  // d'accéder aux pages du cabinet — sinon un accès direct à /dashboard contournerait le 2FA.
  if (isProtected && user) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal && aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      const url = request.nextUrl.clone()
      url.pathname = '/2fa-verify'
      return NextResponse.redirect(url)
    }
  }

  return response
}
