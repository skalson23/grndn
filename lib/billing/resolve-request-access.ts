import type { NextRequest } from 'next/server'

import {
  hasBetaAccessCookie,
  resolveBillingAccess,
} from '@/lib/billing/access'
import { isPaymentsEnabled } from '@/lib/billing/config'
import { getUserSubscription } from '@/lib/billing/subscriptions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function resolveBillingAccessForRequest(request: NextRequest) {
  if (!isPaymentsEnabled()) {
    return {
      allowed: true,
      reason: 'payments_disabled' as const,
      billingStatus: null,
    }
  }

  if (hasBetaAccessCookie(request)) {
    return {
      allowed: true,
      reason: 'beta_cookie' as const,
      billingStatus: 'beta' as const,
    }
  }

  if (!isSupabaseConfigured()) {
    return {
      allowed: false,
      reason: 'no_access' as const,
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
        reason: 'no_access' as const,
        billingStatus: null,
      }
    }

    const subscription = await getUserSubscription(user.id)
    return resolveBillingAccess(
      request,
      subscription?.billing_status ?? null,
      subscription?.is_beta_grandfathered ?? false
    )
  } catch {
    return {
      allowed: false,
      reason: 'no_access' as const,
      billingStatus: null,
    }
  }
}
