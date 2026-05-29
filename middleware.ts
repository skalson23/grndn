import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { getSupabasePublicEnv } from '@/lib/supabase/config'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  const { url, key } = getSupabasePublicEnv()
  if (!url || !key) {
    return intlResponse
  }

  let response = intlResponse

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  try {
    await supabase.auth.getUser()
  } catch {
    // Auth refresh is optional; never block page loads
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
