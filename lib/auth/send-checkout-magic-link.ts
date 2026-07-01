'use client'

import { writePendingCheckout } from '@/lib/assessment/checkout-pending-storage'
import type { StripeBillingPlan } from '@/lib/billing/stripe-plans'
import { sendMagicLink } from '@/lib/programs/saved-programs'

export async function sendCheckoutMagicLink(
  email: string,
  plan: StripeBillingPlan,
  locale: string
): Promise<void> {
  writePendingCheckout({ plan, locale })

  await sendMagicLink(email.trim(), {
    next: `/${locale}/assessment?resumeCheckout=${plan}`,
  })
}
