export const BILLING_STATUSES = ['beta', 'active', 'cancelled', 'expired'] as const

export type BillingStatus = (typeof BILLING_STATUSES)[number]

export type StripeBillingPlan = 'monthly' | 'quarterly'

export type UserSubscriptionRow = {
  user_id: string
  email: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  billing_status: BillingStatus
  current_period_end: string | null
  is_beta_grandfathered: boolean
  created_at: string
  updated_at: string
}

export type BillingAccessResult = {
  allowed: boolean
  reason:
    | 'payments_disabled'
    | 'beta_cookie'
    | 'beta_grandfathered'
    | 'active_subscription'
    | 'no_access'
  billingStatus: BillingStatus | null
}
