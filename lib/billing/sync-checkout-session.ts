import type Stripe from 'stripe'

import { getStripeClient } from '@/lib/stripe/client'
import { isAdminSupabaseConfigured } from '@/lib/supabase/admin'

import {
  mapStripeSubscriptionStatus,
  upsertUserSubscription,
} from './subscriptions'
import type { UserSubscriptionRow } from './types'

export class CheckoutSyncError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'CheckoutSyncError'
    this.code = code
  }
}

function periodEndIso(subscription: Stripe.Subscription): string | null {
  const end = subscription.current_period_end
  return end ? new Date(end * 1000).toISOString() : null
}

/**
 * Activates or updates subscription state from a completed Stripe Checkout Session.
 * Used by the webhook and the post-checkout verify endpoint.
 */
export async function syncCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<UserSubscriptionRow> {
  if (!isAdminSupabaseConfigured()) {
    throw new CheckoutSyncError(
      'SUPABASE_SERVICE_ROLE_KEY is not configured — cannot activate subscription.',
      'service_role_missing'
    )
  }

  const userId = session.client_reference_id ?? session.metadata?.supabase_user_id
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  if (!userId) {
    throw new CheckoutSyncError(
      'Checkout session is missing client_reference_id / supabase_user_id metadata.',
      'missing_user_id'
    )
  }

  if (!customerId) {
    throw new CheckoutSyncError(
      'Checkout session is missing Stripe customer id.',
      'missing_customer_id'
    )
  }

  const stripe = getStripeClient()
  let billingStatus = 'active' as const
  let currentPeriodEnd: string | null = null

  if (subscriptionId) {
    const sub =
      typeof session.subscription === 'object' && session.subscription
        ? (session.subscription as Stripe.Subscription)
        : await stripe.subscriptions.retrieve(subscriptionId)

    billingStatus = mapStripeSubscriptionStatus(sub.status, sub.cancel_at_period_end)
    currentPeriodEnd = periodEndIso(sub)
  }

  const email =
    session.customer_email ?? session.customer_details?.email ?? ''

  const row = await upsertUserSubscription({
    user_id: userId,
    email,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId ?? null,
    billing_status: billingStatus,
    current_period_end: currentPeriodEnd,
  })

  if (!row) {
    throw new CheckoutSyncError(
      'Failed to save subscription to database.',
      'subscription_upsert_failed'
    )
  }

  return row
}
