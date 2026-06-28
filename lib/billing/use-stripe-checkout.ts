'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ensureCheckoutAuth } from '@/lib/billing/ensure-checkout-auth'
import type { StripeBillingPlan } from '@/lib/billing/stripe-plans'

function logCheckoutError(message: string, details?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[GRNDN checkout]', message, details)
  }
}

export function useStripeCheckout() {
  const t = useTranslations('billing.pricing')
  const [loadingPlan, setLoadingPlan] = useState<StripeBillingPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkout = useCallback(
    async (plan: StripeBillingPlan, locale?: string) => {
      setLoadingPlan(plan)
      setError(null)

      try {
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
          const message = body.error ?? t('checkoutFailed')
          logCheckoutError(message, { status: res.status, plan, body })
          throw new Error(message)
        }

        window.location.assign(body.url)
      } catch (e) {
        const message = e instanceof Error ? e.message : t('checkoutFailed')
        setError(message)
        toast.error(message)
        logCheckoutError(message, e)
      } finally {
        setLoadingPlan(null)
      }
    },
    [t]
  )

  return { checkout, loadingPlan, error, setError }
}
