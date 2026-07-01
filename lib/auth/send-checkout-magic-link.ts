'use client'

import { writePendingCheckout } from '@/lib/assessment/checkout-pending-storage'
import { writeAuthReturnPath } from '@/lib/auth/auth-return-path'
import type { StripeBillingPlan } from '@/lib/billing/types'
import { sendMagicLink } from '@/lib/programs/saved-programs'

export async function sendCheckoutMagicLink(
  email: string,
  plan: StripeBillingPlan,
  locale: string
): Promise<void> {
  const returnPath = `/${locale}/assessment`

  writePendingCheckout({ plan, locale })
  writeAuthReturnPath(returnPath)

  await sendMagicLink(email.trim(), { next: returnPath })
}
