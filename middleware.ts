import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import {
  extractLocaleFromPathname,
  isPremiumPathname,
} from '@/lib/billing/access'
import { isPaymentsEnabled } from '@/lib/billing/config'
import { resolveBillingAccessForRequest } from '@/lib/billing/resolve-request-access'
import { routing } from '@/i18n/routing'
import { localePath } from '@/i18n/routing'
import { getSupabasePublicEnv } from '@/lib/supabase/config'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  const { url, key } = getSupabasePublicEnv()
  if (!url || !key) {
    return applyPremiumGuard(request, intlResponse)
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

  return applyPremiumGuard(request, response)
}

async function applyPremiumGuard(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  if (!isPaymentsEnabled()) {
    return response
  }

  const pathname = request.nextUrl.pathname
  if (!isPremiumPathname(pathname)) {
    return response
  }

  // Allow billing success/cancel/pricing without subscription
  if (
    pathname.includes('/billing/') ||
    pathname.includes('/pricing')
  ) {
    return response
  }

  const access = await resolveBillingAccessForRequest(request)
  if (access.allowed) {
    return response
  }

  const locale = routing.locales.includes(
    extractLocaleFromPathname(pathname) as 'en' | 'pl'
  )
    ? (extractLocaleFromPathname(pathname) as 'en' | 'pl')
    : routing.defaultLocale

  const pricingUrl = new URL(localePath(locale, '/pricing'), request.url)
  pricingUrl.searchParams.set('reason', 'subscription_required')
  return NextResponse.redirect(pricingUrl)
}

export const config = {
  matcher: [
    '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
