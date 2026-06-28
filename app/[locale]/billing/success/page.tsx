'use client'

import { useEffect, useState } from 'react'

import { PlanGenerationLoader } from '@/components/workout-plan/plan-generation-loader'
import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Link, useRouter } from '@/i18n/navigation'
import { readAssessmentProfile } from '@/lib/assessment/storage'
import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function BillingSuccessPage() {
  const t = useTranslations('billing.success')
  const router = useRouter()
  const [profile, setProfile] = useState<OnboardingData | null | undefined>(undefined)

  useEffect(() => {
    setProfile(readAssessmentProfile())
  }, [])

  if (profile === undefined) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <BrandLogo size="md" glow="soft" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-center">
        <BrandLogo size="md" glow="soft" className="mb-8 items-center" />
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

  return (
    <PlanGenerationLoader
      variant="postPayment"
      data={profile}
      onComplete={() => router.push('/results')}
    />
  )
}
