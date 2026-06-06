import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { getStripeWebhookSecret } from '@/lib/billing/config'
import {
  mapStripeSubscriptionStatus,
  updateSubscriptionByStripeCustomerId,
  upsertUserSubscription,
} from '@/lib/billing/subscriptions'
import { getStripeClient } from '@/lib/stripe/client'

export const runtime = 'nodejs'

function periodEndIso(subscription: Stripe.Subscription): string | null {
  const end = subscription.current_period_end
  return end ? new Date(end * 1000).toISOString() : null
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.supabase_user_id
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  if (!userId || !customerId) {
    console.error('[GRNDN stripe webhook] checkout.session.completed missing ids')
    return
  }

  const stripe = getStripeClient()
  let billingStatus = 'active' as const
  let currentPeriodEnd: string | null = null

  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    billingStatus = mapStripeSubscriptionStatus(sub.status, sub.cancel_at_period_end)
    currentPeriodEnd = periodEndIso(sub)
  }

  await upsertUserSubscription({
    user_id: userId,
    email: session.customer_email ?? session.customer_details?.email ?? '',
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId ?? null,
    billing_status: billingStatus,
    current_period_end: currentPeriodEnd,
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

  if (!customerId) return

  await updateSubscriptionByStripeCustomerId(customerId, {
    stripe_subscription_id: subscription.id,
    billing_status: mapStripeSubscriptionStatus(
      subscription.status,
      subscription.cancel_at_period_end
    ),
    current_period_end: periodEndIso(subscription),
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

  if (!customerId) return

  await updateSubscriptionByStripeCustomerId(customerId, {
    billing_status: 'expired',
    stripe_subscription_id: null,
    current_period_end: null,
  })
}

export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret()
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not configured.' },
      { status: 503 }
    )
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  const body = await request.text()
  const stripe = getStripeClient()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid webhook signature.'
    console.error('[GRNDN stripe webhook] signature failed', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      default:
        break
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Webhook handler failed.'
    console.error('[GRNDN stripe webhook] handler error', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
