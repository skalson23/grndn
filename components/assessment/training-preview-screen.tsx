'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PricingPlans } from '@/components/billing/pricing-plans'
import { BrandLogo } from '@/components/brand/brand-logo'
import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { writeAssessmentProfile } from '@/lib/assessment/storage'
import { buildProfilePreviewSnapshot } from '@/lib/workout-plan/build-profile-preview'
import { cn } from '@/lib/utils'

type TrainingPreviewScreenProps = {
  profile: OnboardingData
  progressStep: number
  totalSteps: number
}

const summaryKeys = [
  'frequency',
  'primaryGoal',
  'experience',
  'recovery',
  'weeklyVolume',
  'trainingSplit',
  'sessionDuration',
] as const

export function TrainingPreviewScreen({
  profile,
  progressStep,
  totalSteps,
}: TrainingPreviewScreenProps) {
  const t = useTranslations('assessment.preview')
  const labels = useOnboardingLabels()

  useEffect(() => {
    writeAssessmentProfile(profile)
  }, [profile])

  const snapshot = useMemo(
    () =>
      buildProfilePreviewSnapshot(profile, {
        goalLabel: labels.goalLabel,
        experienceLabel: labels.experienceLabel,
        activityLevelLabel: labels.activityLevelLabel,
        trainingStyleLabel: labels.trainingStyleLabel,
        frequencyDays: (count) => t('values.frequencyDays', { count }),
        durationMin: (count) => t('values.durationMin', { count }),
        splitLabel: (key) => t(`splits.${key}`),
        volumeLabel: (key) => t(`volume.${key}`),
        recoveryLabel: (key) => t(`recovery.${key}`),
        dayLabel: (index) => t('dayLabel', { day: index }),
      }),
    [profile, labels, t]
  )

  const summaryValues: Record<(typeof summaryKeys)[number], string> = {
    frequency: snapshot.frequencyLabel,
    primaryGoal: snapshot.primaryGoalLabel,
    experience: snapshot.experienceLabel,
    recovery: snapshot.recoveryLabel,
    weeklyVolume: snapshot.weeklyVolumeLabel,
    trainingSplit: snapshot.trainingSplitLabel,
    sessionDuration: snapshot.sessionDurationLabel,
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.18),transparent_35%)]"
      />

      <ProgressBar currentStep={progressStep} totalSteps={totalSteps} />

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 pb-16 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <BrandLogo size="md" variant="logotype" glow="soft" align="center" className="mb-6" />
            <h1 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {t('headline')}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8 rounded-[1.75rem] border border-border/80 bg-card/70 p-5 backdrop-blur sm:p-6"
          >
            <ul className="space-y-3.5">
              {summaryKeys.map((key, index) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.04 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[oklch(0.52_0.16_25)]/15 text-[oklch(0.62_0.17_25)]">
                    <Check className="size-3" strokeWidth={3} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t(`summary.${key}`)}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {summaryValues[key]}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative mb-10 overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/60 p-5 backdrop-blur sm:p-6"
          >
            <p className="mb-4 text-sm font-semibold tracking-tight text-foreground">
              {t('planPreviewTitle')}
            </p>

            <div className="space-y-3">
              {snapshot.previewDayLabels.map((dayLabel) => (
                <div key={dayLabel} className="rounded-xl border border-border/60 bg-background/40 px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{dayLabel}</p>
                  <div
                    className={cn(
                      'h-3 rounded-md bg-gradient-to-r from-muted/80 via-muted/50 to-muted/80',
                      'select-none blur-[6px]'
                    )}
                    aria-hidden
                  />
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/80 bg-card/90 px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <div className="flex size-10 items-center justify-center rounded-full bg-[oklch(0.52_0.16_25)]/20 text-[oklch(0.62_0.17_25)]">
                  <Lock className="size-4" />
                </div>
                <p className="max-w-[220px] text-center text-sm font-medium leading-snug text-foreground">
                  {t('unlockMessage')}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{t('pricingTitle')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('pricingSubtitle')}</p>
            </div>
            <PricingPlans showHeader={false} variant="preview" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
