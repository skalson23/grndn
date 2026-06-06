import { NextResponse } from 'next/server'

import { isPaymentsEnabled, isStripeConfigured } from '@/lib/billing/config'
import { getUserSubscription, upsertUserSubscription } from '@/lib/billing/subscriptions'
import { localePath, routing } from '@/i18n/routing'
import { getStripeClient } from '@/lib/stripe/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getAuthRedirectOrigin } from '@/lib/supabase/site-origin'

type CheckoutBody = {
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

  let body: CheckoutBody = {}
  try {
    body = (await request.json()) as CheckoutBody
  } catch {
    // optional body
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
    return NextResponse.json(
      { error: 'Sign in with email before purchasing.' },
      { status: 401 }
    )
  }

  const stripe = getStripeClient()
  const priceId = process.env.STRIPE_PRICE_ID!.trim()
  const origin = getAuthRedirectOrigin(request)

  let subscription = await getUserSubscription(user.id)
  let customerId = subscription?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    subscription = await upsertUserSubscription({
      user_id: user.id,
      email: user.email,
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
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
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
}
