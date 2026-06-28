'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import { PricingPlans } from '@/components/billing/pricing-plans'
import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

type PricingPageProps = {
  reason?: string | null
}

export function PricingPage({ reason }: PricingPageProps) {
  const t = useTranslations('billing.pricing')

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-5 py-16 text-foreground sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.18),transparent_40%)]"
      />
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <BrandLogo size="stage" variant="logotype" glow="hero" className="mb-8 items-center" />

          {reason === 'subscription_required' && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 max-w-lg rounded-2xl border border-[oklch(0.52_0.16_25)]/30 bg-[oklch(0.52_0.16_25)]/10 px-4 py-3 text-sm text-muted-foreground"
            >
              {t('subscriptionRequired')}
            </motion.p>
          )}
        </div>

        <PricingPlans showHeader />

        <div className="mt-10 text-center">
          <Button variant="ghost" className="rounded-xl" asChild>
            <Link href="/">{t('backHome')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
