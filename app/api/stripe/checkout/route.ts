import { NextResponse } from 'next/server'

import { isPaymentsEnabled, isStripeConfigured } from '@/lib/billing/config'
import {
  getStripePriceIdForPlan,
  type StripeBillingPlan,
} from '@/lib/billing/stripe-plans'
import { getUserSubscription, upsertUserSubscription } from '@/lib/billing/subscriptions'
import { localePath, routing } from '@/i18n/routing'
import { getStripeClient } from '@/lib/stripe/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getAuthRedirectOrigin } from '@/lib/supabase/site-origin'
import {
  getStripeErrorDetails,
  logStripeError,
  stripeErrorStatusCode,
} from '@/lib/billing/stripe-errors'

type CheckoutBody = {
  locale?: string
  plan?: StripeBillingPlan
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

  let body: CheckoutBody = {}
  try {
    body = (await request.json()) as CheckoutBody
  } catch {
    // optional body
  }

  const plan: StripeBillingPlan =
    body.plan === 'quarterly' ? 'quarterly' : 'monthly'
  const priceId = getStripePriceIdForPlan(plan)

  if (!priceId) {
    return NextResponse.json(
      { error: 'Billing plan is not configured.' },
      { status: 503 }
    )
  }

  const locale = routing.locales.includes(body.locale as 'en' | 'pl')
    ? (body.locale as 'en' | 'pl')
    : routing.defaultLocale

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[GRNDN checkout] Supabase getUser failed', userError.message)
    }
    return NextResponse.json(
      { error: `Supabase auth error: ${userError.message}` },
      { status: 401 }
    )
  }

  if (!user) {
    return NextResponse.json(
      { error: 'Sign in with your account before purchasing.' },
      { status: 401 }
    )
  }

  if (!user.email || user.is_anonymous) {
    return NextResponse.json(
      { error: 'A verified account email is required before checkout.' },
      { status: 401 }
    )
  }

  const stripe = getStripeClient()
  const origin = getAuthRedirectOrigin(request)

  try {
    let subscription = await getUserSubscription(user.id)
    let customerId = subscription?.stripe_customer_id ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        ...(user.email ? { email: user.email } : {}),
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      subscription = await upsertUserSubscription({
        user_id: user.id,
        email: user.email ?? '',
        stripe_customer_id: customerId,
        billing_status: subscription?.billing_status ?? 'expired',
        is_beta_grandfathered: subscription?.is_beta_grandfathered ?? false,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${localePath(locale, '/billing/success')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${localePath(locale, '/billing/cancel')}`,
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        billing_plan: plan,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          billing_plan: plan,
        },
      },
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Could not create checkout session.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const details = logStripeError('checkout create', error)
    const status = stripeErrorStatusCode(error, 500)

    return NextResponse.json(
      {
        error: details.message,
        code: details.code ?? details.type ?? 'stripe_error',
        ...(process.env.NODE_ENV === 'development'
          ? {
              details: {
                type: details.type,
                code: details.code,
                param: details.param,
                statusCode: details.statusCode,
              },
            }
          : {}),
      },
      { status }
    )
  }
}
