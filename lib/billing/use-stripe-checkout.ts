'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'

import type { StripeBillingPlan } from '@/lib/billing/stripe-plans'

export function useStripeCheckout() {
  const t = useTranslations('billing.pricing')
  const [loadingPlan, setLoadingPlan] = useState<StripeBillingPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkout = useCallback(
    async (plan: StripeBillingPlan, locale?: string) => {
      setLoadingPlan(plan)
      setError(null)

      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, locale }),
        })
        const body = (await res.json()) as { url?: string; error?: string }
        if (!res.ok || !body.url) {
          throw new Error(body.error ?? t('checkoutFailed'))
        }
        window.location.href = body.url
      } catch (e) {
        setError(e instanceof Error ? e.message : t('checkoutFailed'))
      } finally {
        setLoadingPlan(null)
      }
    },
    [t]
  )

  return { checkout, loadingPlan, error, setError }
}
