'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useStripeCheckout } from '@/lib/billing/use-stripe-checkout'
import {
  PRO_MONTHLY_FEATURES,
  PRO_QUARTERLY_FEATURES,
} from '@/lib/landing/saas-content'
import { cn } from '@/lib/utils'

type PricingPlansProps = {
  showHeader?: boolean
  className?: string
  variant?: 'default' | 'preview'
}

const primaryButtonClass = cn(
  'h-12 rounded-2xl font-semibold active:scale-[0.98]',
  'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
  'border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)]'
)

export function PricingPlans({
  showHeader = true,
  className,
  variant = 'default',
}: PricingPlansProps) {
  const t = useTranslations('landing.pricing')
  const tPreview = useTranslations('assessment.preview.pricing')
  const tBilling = useTranslations('billing.pricing')
  const locale = useLocale()
  const { checkout, loadingPlan, error } = useStripeCheckout()

  return (
    <div className={className}>
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="mx-auto grid max-w-4xl items-stretch gap-5 sm:gap-6 md:grid-cols-2">
        {/* Monthly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="flex flex-col rounded-[1.75rem] border border-border/80 bg-card/60 p-6 backdrop-blur sm:p-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {variant === 'preview' ? tPreview('monthly.name') : t('monthly.name')}
          </p>
          <div className="mt-4 flex items-end gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {variant === 'preview' ? tPreview('monthly.price') : t('monthly.price')}
            </span>
            <span className="mb-1 text-sm text-muted-foreground">
              {variant === 'preview' ? tPreview('monthly.period') : t('monthly.period')}
            </span>
          </div>
          <ul className="mt-8 flex-1 space-y-2.5">
            {PRO_MONTHLY_FEATURES.map((featureKey) => (
              <li key={featureKey} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-[oklch(0.62_0.17_25)]" />
                <span>{t(`monthly.features.${featureKey}`)}</span>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            disabled={loadingPlan !== null}
            onClick={() => checkout('monthly', locale)}
            className="mt-8 h-12 w-full rounded-2xl border-border bg-background/50"
          >
            {loadingPlan === 'monthly' ? (
              <>
                <Spinner className="size-4" />
                {tBilling('redirecting')}
              </>
            ) : variant === 'preview' ? (
              tPreview('monthly.cta')
            ) : (
              t('monthly.cta')
            )}
          </Button>
        </motion.div>

        {/* Quarterly — Best Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          whileHover={{ y: -6 }}
          className={cn(
            'relative flex flex-col overflow-hidden rounded-[1.75rem] border p-6 sm:p-8',
            'border-[oklch(0.52_0.16_25)]/55 bg-card/85 backdrop-blur',
            'shadow-[0_0_0_1px_rgba(127,29,29,0.2),0_0_60px_rgba(127,29,29,0.18),0_30px_80px_rgba(0,0,0,0.35)]',
            'md:scale-[1.02] md:shadow-[0_0_0_1px_rgba(127,29,29,0.35),0_0_80px_rgba(127,29,29,0.28),0_40px_100px_rgba(0,0,0,0.4)]'
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[oklch(0.52_0.16_25)]/16 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-[oklch(0.52_0.16_25)]/30"
          />

          <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.62_0.17_25)]">
              {variant === 'preview' ? tPreview('quarterly.name') : t('quarterly.name')}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.52_0.16_25)]/40 bg-[oklch(0.52_0.16_25)]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[oklch(0.72_0.17_25)]">
              <Star className="size-3 fill-current" />
              {variant === 'preview'
                ? tPreview('quarterly.bestValueBadge')
                : t('quarterly.bestValueBadge')}
            </span>
          </div>

          <div className="relative flex items-end gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {variant === 'preview' ? tPreview('quarterly.price') : t('quarterly.price')}
            </span>
            <span className="mb-1 text-sm text-muted-foreground">
              {variant === 'preview' ? tPreview('quarterly.period') : t('quarterly.period')}
            </span>
          </div>

          <p className="relative mt-3 text-sm font-medium text-[oklch(0.72_0.14_25)]">
            {variant === 'preview' ? tPreview('quarterly.plansIncluded') : t('quarterly.savings')}
          </p>

          <ul className="relative mt-8 flex-1 space-y-2.5">
            {PRO_QUARTERLY_FEATURES.map((featureKey) => (
              <li key={featureKey} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-[oklch(0.62_0.17_25)]" />
                <span>{t(`quarterly.features.${featureKey}`)}</span>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => checkout('quarterly', locale)}
            className={cn('relative mt-8 h-12 w-full', primaryButtonClass)}
          >
            {loadingPlan === 'quarterly' ? (
              <>
                <Spinner className="size-4" />
                {tBilling('redirecting')}
              </>
            ) : variant === 'preview' ? (
              <>
                <Sparkles className="size-4" />
                {tPreview('quarterly.cta')}
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                {t('quarterly.cta')}
              </>
            )}
          </Button>
          <p className="relative mt-3 text-center text-xs text-muted-foreground">
            {tBilling('footnote')}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
