import { NextResponse } from 'next/server'

import {
  hasBetaAccessCookie,
  resolveBillingAccess,
} from '@/lib/billing/access'
import { isPaymentsEnabled } from '@/lib/billing/config'
import { getUserSubscription } from '@/lib/billing/subscriptions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function GET(request: Request) {
  if (!isPaymentsEnabled()) {
    return NextResponse.json({
      paymentsEnabled: false,
      access: { allowed: true, reason: 'payments_disabled', billingStatus: null },
      subscription: null,
    })
  }

  const betaCookie = hasBetaAccessCookie(request as import('next/server').NextRequest)

  if (betaCookie) {
    return NextResponse.json({
      paymentsEnabled: true,
      access: {
        allowed: true,
        reason: 'beta_cookie',
        billingStatus: 'beta',
      },
      subscription: null,
    })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      paymentsEnabled: true,
      access: { allowed: false, reason: 'no_access', billingStatus: null },
      subscription: null,
    })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({
        paymentsEnabled: true,
        access: { allowed: false, reason: 'no_access', billingStatus: null },
        subscription: null,
      })
    }

    const subscription = await getUserSubscription(user.id)
    const access = resolveBillingAccess(
      request as import('next/server').NextRequest,
      subscription?.billing_status ?? null,
      subscription?.is_beta_grandfathered ?? false
    )

    return NextResponse.json({
      paymentsEnabled: true,
      access,
      subscription,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not load billing status.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
