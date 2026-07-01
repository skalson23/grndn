import 'server-only'

import { createAdminClient, isAdminSupabaseConfigured } from '@/lib/supabase/admin'

import type { BillingStatus, UserSubscriptionRow } from './types'

export async function getUserSubscription(
  userId: string
): Promise<UserSubscriptionRow | null> {
  if (!isAdminSupabaseConfigured()) return null

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as UserSubscriptionRow
}

export async function upsertUserSubscription(
  payload: Partial<UserSubscriptionRow> & { user_id: string; email: string }
): Promise<UserSubscriptionRow | null> {
  if (!isAdminSupabaseConfigured()) return null

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('user_subscriptions')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) {
    console.error('[GRNDN billing] upsert failed', error.message)
    return null
  }

  return data as UserSubscriptionRow
}

export async function updateSubscriptionByStripeCustomerId(
  stripeCustomerId: string,
  updates: Partial<
    Pick<
      UserSubscriptionRow,
      | 'billing_status'
      | 'stripe_subscription_id'
      | 'current_period_end'
      | 'is_beta_grandfathered'
    >
  >
): Promise<void> {
  if (!isAdminSupabaseConfigured()) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('user_subscriptions')
    .update(updates)
    .eq('stripe_customer_id', stripeCustomerId)

  if (error) {
    console.error('[GRNDN billing] stripe customer update failed', error.message)
  }
}

export async function grantBetaAccess(
  userId: string,
  email: string
): Promise<UserSubscriptionRow | null> {
  return upsertUserSubscription({
    user_id: userId,
    email,
    billing_status: 'beta',
    is_beta_grandfathered: true,
  })
}

export async function syncBetaAccessFromCookie(
  userId: string,
  email: string,
  hasBetaCookie: boolean
): Promise<void> {
  if (!hasBetaCookie) return

  const existing = await getUserSubscription(userId)
  if (existing?.is_beta_grandfathered || existing?.billing_status === 'beta') {
    return
  }

  await grantBetaAccess(userId, email)
}

export function mapStripeSubscriptionStatus(
  stripeStatus: string,
  cancelAtPeriodEnd: boolean
): BillingStatus {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') {
    return cancelAtPeriodEnd ? 'cancelled' : 'active'
  }
  if (stripeStatus === 'canceled' || stripeStatus === 'unpaid') {
    return 'expired'
  }
  if (stripeStatus === 'past_due') {
    return 'expired'
  }
  return 'expired'
}
