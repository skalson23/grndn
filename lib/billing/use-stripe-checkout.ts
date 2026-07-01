'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import {
  readPendingCheckout,
  writePendingCheckout,
} from '@/lib/assessment/checkout-pending-storage'
import { writeAuthReturnPath } from '@/lib/auth/auth-return-path'
import { getAuthenticatedUser } from '@/lib/auth/authenticated-user'
import { redirectToStripeCheckout } from '@/lib/billing/redirect-to-stripe-checkout'
import type { StripeBillingPlan } from '@/lib/billing/types'

export function useStripeCheckout() {
  const t = useTranslations('billing.pricing')
  const [loadingPlan, setLoadingPlan] = useState<StripeBillingPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<StripeBillingPlan | null>(null)

  const runCheckout = useCallback(
    async (plan: StripeBillingPlan, locale: string) => {
      setLoadingPlan(plan)
      setError(null)

      try {
        await redirectToStripeCheckout(plan, locale, t('checkoutFailed'))
      } catch (e) {
        const message = e instanceof Error ? e.message : t('checkoutFailed')
        setError(message)
        toast.error(message)
        throw e
      } finally {
        setLoadingPlan(null)
      }
    },
    [t]
  )

  const checkout = useCallback(
    async (plan: StripeBillingPlan, locale?: string) => {
      const resolvedLocale = locale ?? 'en'
      writePendingCheckout({ plan, locale: resolvedLocale })
      writeAuthReturnPath(`/${resolvedLocale}/assessment`)

      const user = await getAuthenticatedUser()
      if (!user) {
        setPendingPlan(plan)
        setAuthModalOpen(true)
        return
      }

      await runCheckout(plan, resolvedLocale)
    },
    [runCheckout]
  )

  const handleAuthenticated = useCallback(async () => {
    const plan = pendingPlan ?? readPendingCheckout()?.plan
    if (!plan) return

    const locale = readPendingCheckout()?.locale ?? 'en'
    setPendingPlan(null)
    setAuthModalOpen(false)
    await runCheckout(plan, locale)
  }, [pendingPlan, runCheckout])

  const onAuthModalOpenChange = useCallback((open: boolean) => {
    setAuthModalOpen(open)
    if (!open) setPendingPlan(null)
  }, [])

  return {
    checkout,
    loadingPlan,
    error,
    setError,
    authModalOpen,
    pendingPlan,
    handleAuthenticated,
    onAuthModalOpenChange,
  }
}
