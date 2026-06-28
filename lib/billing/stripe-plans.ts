export type StripeBillingPlan = 'monthly' | 'quarterly'

export function getStripePriceIdForPlan(plan: StripeBillingPlan): string | null {
  if (plan === 'monthly') {
    return (
      process.env.STRIPE_PRICE_ID_MONTHLY?.trim() ||
      process.env.STRIPE_PRICE_ID?.trim() ||
      null
    )
  }

  return process.env.STRIPE_PRICE_ID_QUARTERLY?.trim() || null
}

export function isStripePlansConfigured(): boolean {
  return Boolean(
    getStripePriceIdForPlan('monthly') && getStripePriceIdForPlan('quarterly')
  )
}
