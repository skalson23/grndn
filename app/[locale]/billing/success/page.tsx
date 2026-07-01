'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import { PlanGenerationLoader } from '@/components/workout-plan/plan-generation-loader'
import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Link, useRouter } from '@/i18n/navigation'
import { readAssessmentProfile } from '@/lib/assessment/storage'
import { verifyCheckoutSession } from '@/lib/billing/verify-checkout-session'
import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { cn } from '@/lib/utils'

type SuccessPhase = 'loading' | 'verifying' | 'generating' | 'verify_error' | 'missing_profile'

export default function BillingSuccessPage() {
  const t = useTranslations('billing.success')
  const router = useRouter()
  const [phase, setPhase] = useState<SuccessPhase>('loading')
  const [profile, setProfile] = useState<OnboardingData | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const checkoutSessionId = params.get('session_id')?.trim() ?? null
    setSessionId(checkoutSessionId)

    const savedProfile = readAssessmentProfile()
    setProfile(savedProfile)

    if (!savedProfile) {
      setPhase('missing_profile')
      return
    }

    if (!checkoutSessionId) {
      setVerifyError(t('missingSessionId'))
      setPhase('verify_error')
      return
    }

    let cancelled = false

    const run = async () => {
      setPhase('verifying')
      try {
        await verifyCheckoutSession(checkoutSessionId)
        if (!cancelled) {
          setPhase('generating')
        }
      } catch (error) {
        if (!cancelled) {
          setVerifyError(
            error instanceof Error ? error.message : t('verifyFailed')
          )
          setPhase('verify_error')
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [t])

  if (phase === 'loading' || phase === 'verifying') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-center">
        <BrandLogo size="md" variant="logotype" glow="soft" align="center" className="mb-8" />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <h1 className="text-xl font-semibold tracking-tight">
            {phase === 'verifying' ? t('verifyingTitle') : t('title')}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {phase === 'verifying' ? t('verifyingDescription') : t('description')}
          </p>
          {sessionId && phase === 'verifying' && (
            <p className="mt-4 text-[10px] text-muted-foreground/70">
              {t('sessionNote')}
            </p>
          )}
        </motion.div>
      </div>
    )
  }

  if (phase === 'missing_profile') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-center">
        <BrandLogo size="md" glow="soft" align="center" className="mb-8" />
        <h1 className="text-2xl font-semibold tracking-tight">{t('missingProfileTitle')}</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">{t('missingProfileDescription')}</p>
        <Button
          asChild
          size="lg"
          className={cn(
            'mt-8 h-14 rounded-2xl px-8',
            'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
            'border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)]'
          )}
        >
          <Link href="/assessment">{t('missingProfileCta')}</Link>
        </Button>
      </div>
    )
  }

  if (phase === 'verify_error') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-center">
        <BrandLogo size="md" glow="soft" align="center" className="mb-8" />
        <h1 className="text-2xl font-semibold tracking-tight">{t('verifyErrorTitle')}</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-destructive" role="alert">
          {verifyError}
        </p>
        {sessionId && (
          <p className="mt-4 text-[10px] text-muted-foreground/70">
            session_id: {sessionId.slice(0, 20)}…
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/assessment">{t('missingProfileCta')}</Link>
          </Button>
          <Button
            type="button"
            className="rounded-2xl"
            onClick={() => window.location.reload()}
          >
            {t('retryVerify')}
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'generating' && profile) {
    return (
      <PlanGenerationLoader
        variant="postPayment"
        data={profile}
        onComplete={() => router.push('/results')}
      />
    )
  }

  return null
}
