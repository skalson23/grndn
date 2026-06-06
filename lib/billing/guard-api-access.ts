import type { BillingAccessResult } from '@/lib/billing/types'
import { hasBetaAccessCookie, resolveBillingAccess } from '@/lib/billing/access'
import { BETA_ACCESS_COOKIE } from '@/lib/billing/constants'
import { isPaymentsEnabled } from '@/lib/billing/config'
import { getUserSubscription } from '@/lib/billing/subscriptions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

function parseCookieHeader(cookieHeader: string | null): Map<string, string> {
  const map = new Map<string, string>()
  if (!cookieHeader) return map

  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=')
    if (!rawKey) continue
    map.set(rawKey, rest.join('='))
  }
  return map
}

function hasBetaCookieFromHeader(cookieHeader: string | null): boolean {
  return parseCookieHeader(cookieHeader).get(BETA_ACCESS_COOKIE) === 'true'
}

/** Server-side premium access check for API routes when ENABLE_PAYMENTS=true. */
export async function assertPremiumApiAccess(
  request: Request
): Promise<BillingAccessResult> {
  if (!isPaymentsEnabled()) {
    return {
      allowed: true,
      reason: 'payments_disabled',
      billingStatus: null,
    }
  }

  const cookieHeader = request.headers.get('cookie')
  if (hasBetaCookieFromHeader(cookieHeader)) {
    return {
      allowed: true,
      reason: 'beta_cookie',
      billingStatus: 'beta',
    }
  }

  if (!isSupabaseConfigured()) {
    return {
      allowed: false,
      reason: 'no_access',
      billingStatus: null,
    }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return {
        allowed: false,
        reason: 'no_access',
        billingStatus: null,
      }
    }

    const subscription = await getUserSubscription(user.id)
    const fakeRequest = {
      cookies: {
        get: (name: string) => {
          const value = parseCookieHeader(cookieHeader).get(name)
          return value ? { value } : undefined
        },
      },
    } as import('next/server').NextRequest

    if (hasBetaAccessCookie(fakeRequest)) {
      return {
        allowed: true,
        reason: 'beta_cookie',
        billingStatus: 'beta',
      }
    }

    return resolveBillingAccess(
      fakeRequest,
      subscription?.billing_status ?? null,
      subscription?.is_beta_grandfathered ?? false
    )
  } catch {
    return {
      allowed: false,
      reason: 'no_access',
      billingStatus: null,
    }
  }
}
