'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type PricingPageProps = {
  reason?: string | null
}

export function PricingPage({ reason }: PricingPageProps) {
  const t = useTranslations('billing.pricing')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const body = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !body.url) {
        throw new Error(body.error ?? t('checkoutFailed'))
      }
      window.location.href = body.url
    } catch (e) {
      setError(e instanceof Error ? e.message : t('checkoutFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    t('features.aiProtocols'),
    t('features.personalizedPlans'),
    t('features.pdfExport'),
    t('features.savedPrograms'),
    t('features.progression'),
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-16 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.18),transparent_40%)]"
      />
      <div className="relative mx-auto flex w-full max-w-lg flex-col items-center">
        <BrandLogo size="stage" variant="logotype" glow="hero" className="mb-10 items-center" />

        {reason === 'subscription_required' && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-[oklch(0.52_0.16_25)]/30 bg-[oklch(0.52_0.16_25)]/10 px-4 py-3 text-center text-sm text-muted-foreground"
          >
            {t('subscriptionRequired')}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full overflow-hidden rounded-[2rem] border border-border/80 bg-card/80 shadow-[0_30px_120px_rgba(0,0,0,0.4)] backdrop-blur"
        >
          <div className="border-b border-border/70 bg-gradient-to-b from-white/[0.06] to-transparent p-8 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[oklch(0.62_0.17_25)]">
              {t('eyebrow')}
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t('title')}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('subtitle')}</p>
            <div className="mt-8 flex items-end justify-center gap-1">
              <span className="text-5xl font-bold tracking-tight">{t('price')}</span>
              <span className="mb-2 text-sm text-muted-foreground">{t('period')}</span>
            </div>
          </div>

          <ul className="space-y-3 p-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-[oklch(0.62_0.17_25)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border/70 p-8 pt-6">
            {error && (
              <p className="mb-4 text-center text-sm text-destructive">{error}</p>
            )}
            <Button
              type="button"
              size="lg"
              disabled={isLoading}
              onClick={handleCheckout}
              className={cn(
                'h-14 w-full rounded-2xl text-base font-semibold',
                'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
                'border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)]'
              )}
            >
              {isLoading ? (
                <>
                  <Spinner className="size-4" />
                  {t('redirecting')}
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {t('cta')}
                </>
              )}
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">{t('footnote')}</p>
            <div className="mt-6 text-center">
              <Button variant="ghost" className="rounded-xl" asChild>
                <Link href="/">{t('backHome')}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
