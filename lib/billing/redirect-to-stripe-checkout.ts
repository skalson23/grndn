'use client'

import { clearPendingCheckout } from '@/lib/assessment/checkout-pending-storage'
import { ensureCheckoutAuth } from '@/lib/billing/ensure-checkout-auth'
import type { StripeBillingPlan } from '@/lib/billing/types'

function logCheckoutError(message: string, details?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[GRNDN checkout]', message, details)
  }
}

export async function redirectToStripeCheckout(
  plan: StripeBillingPlan,
  locale: string,
  checkoutFailedMessage = 'Could not start checkout.'
): Promise<void> {
  await ensureCheckoutAuth()

  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ plan, locale }),
  })

  let body: { url?: string; error?: string } = {}
  try {
    body = (await res.json()) as { url?: string; error?: string }
  } catch {
    body = {}
  }

  if (!res.ok || !body.url) {
    const message = body.error ?? checkoutFailedMessage
    logCheckoutError(message, { status: res.status, plan, body })
    throw new Error(message)
  }

  clearPendingCheckout()
  window.location.assign(body.url)
}
