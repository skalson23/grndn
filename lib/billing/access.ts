import type { NextRequest } from 'next/server'

import { BETA_ACCESS_COOKIE } from './constants'
import { isPaymentsEnabled } from './config'
import type { BillingAccessResult, BillingStatus } from './types'

const GRANTED_STATUSES: BillingStatus[] = ['beta', 'active']

export function hasBetaAccessCookie(request: NextRequest): boolean {
  return request.cookies.get(BETA_ACCESS_COOKIE)?.value === 'true'
}

export function isBillingStatusGranted(status: BillingStatus | null | undefined): boolean {
  if (!status) return false
  return GRANTED_STATUSES.includes(status)
}

export function resolveBillingAccess(
  request: NextRequest,
  billingStatus: BillingStatus | null,
  isBetaGrandfathered: boolean
): BillingAccessResult {
  if (!isPaymentsEnabled()) {
    return {
      allowed: true,
      reason: 'payments_disabled',
      billingStatus,
    }
  }

  if (hasBetaAccessCookie(request)) {
    return {
      allowed: true,
      reason: 'beta_cookie',
      billingStatus,
    }
  }

  if (isBetaGrandfathered || billingStatus === 'beta') {
    return {
      allowed: true,
      reason: 'beta_grandfathered',
      billingStatus,
    }
  }

  if (billingStatus === 'active') {
    return {
      allowed: true,
      reason: 'active_subscription',
      billingStatus,
    }
  }

  return {
    allowed: false,
    reason: 'no_access',
    billingStatus,
  }
}

export function isPremiumPathname(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  // /en/results → ['en', 'results']
  if (segments.length < 2) return false
  const routeSegment = segments[1]
  return routeSegment === 'results' || routeSegment === 'my-programs'
}

export function extractLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0]
  return segment ?? 'en'
}
