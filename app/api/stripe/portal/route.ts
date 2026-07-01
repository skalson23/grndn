import { NextResponse } from 'next/server'

import { isPaymentsEnabled } from '@/lib/billing/config'
import { isStripeConfigured } from '@/lib/billing/stripe-config.server'
import { getUserSubscription } from '@/lib/billing/subscriptions'
import { localePath, routing } from '@/i18n/routing'
import { getStripeClient } from '@/lib/stripe/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getAuthRedirectOrigin } from '@/lib/supabase/site-origin'

export const runtime = 'nodejs'

type PortalBody = {
  locale?: string
}

export async function POST(request: Request) {
  if (!isPaymentsEnabled()) {
    return NextResponse.json(
      { error: 'Payments are not enabled during beta.' },
      { status: 403 }
    )
  }

  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Billing is not configured.' },
      { status: 503 }
    )
  }

  let body: PortalBody = {}
  try {
    body = (await request.json()) as PortalBody
  } catch {
    // optional
  }

  const locale = routing.locales.includes(body.locale as 'en' | 'pl')
    ? (body.locale as 'en' | 'pl')
    : routing.defaultLocale

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await getUserSubscription(user.id)
  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found. Complete checkout first.' },
      { status: 404 }
    )
  }

  const stripe = getStripeClient()
  const origin = getAuthRedirectOrigin(request)

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}${localePath(locale, '/my-programs')}`,
  })

  return NextResponse.json({ url: portalSession.url })
}
