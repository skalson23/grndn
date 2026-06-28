'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { StageLoaderLayout } from '@/components/brand/stage-loader-layout'
import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import {
  PROFILE_ANALYSIS_STAGE_KEYS,
  PROFILE_ANALYSIS_STAGE_MS,
  type ProfileAnalysisStageKey,
} from '@/lib/assessment/profile-analysis-stages'
import { buildAnalysisInsightSignals } from '@/lib/workout-plan/build-plan-analysis'
import { cn } from '@/lib/utils'

type ProfileAnalysisLoaderProps = {
  profile: OnboardingData
  onComplete: () => void
  progressBar?: ReactNode
}

const stepEase = [0.32, 0.72, 0, 1] as const

export function ProfileAnalysisLoader({
  profile,
  onComplete,
  progressBar,
}: ProfileAnalysisLoaderProps) {
  const t = useTranslations('assessment.analysis')
  const tGen = useTranslations('generation')
  const labels = useOnboardingLabels()
  const insightSignals = buildAnalysisInsightSignals(profile)

  const [completedSteps, setCompletedSteps] = useState<ProfileAnalysisStageKey[]>([])
  const [activeStep, setActiveStep] = useState<ProfileAnalysisStageKey>(
    PROFILE_ANALYSIS_STAGE_KEYS[0]
  )
  const [visibleInsightIndex, setVisibleInsightIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    let cancelled = false
    let stageIndex = 0

    const runStage = () => {
      if (cancelled) return
      const key = PROFILE_ANALYSIS_STAGE_KEYS[stageIndex]
      setActiveStep(key)
      setProgress((stageIndex + 0.35) / PROFILE_ANALYSIS_STAGE_KEYS.length)

      window.setTimeout(() => {
        if (cancelled) return
        setCompletedSteps((prev) => [...prev, key])
        setProgress((stageIndex + 1) / PROFILE_ANALYSIS_STAGE_KEYS.length)
        stageIndex += 1

        if (stageIndex < PROFILE_ANALYSIS_STAGE_KEYS.length) {
          runStage()
        } else {
          window.setTimeout(onComplete, 500)
        }
      }, PROFILE_ANALYSIS_STAGE_MS)
    }

    runStage()

    return () => {
      cancelled = true
    }
  }, [onComplete])

  useEffect(() => {
    if (insightSignals.length === 0) return

    const interval = window.setInterval(() => {
      setVisibleInsightIndex((current) => (current + 1) % insightSignals.length)
    }, 1400)

    return () => window.clearInterval(interval)
  }, [insightSignals.length])

  const renderInsight = () => {
    const signal = insightSignals[visibleInsightIndex]
    if (!signal) return null

    switch (signal.id) {
      case 'muscleEmphasis':
        return tGen('insights.muscleEmphasis', {
          muscle: labels.muscleGroupLabel(signal.muscle),
        })
      case 'experienceProfile':
        return tGen('insights.experienceProfile', {
          level: labels.experienceLabel(signal.level),
        })
      case 'trainingDays':
        return tGen('insights.trainingDays', { count: signal.count })
      case 'recoveryProfile':
        return tGen('insights.recoveryProfile')
      case 'maintenanceCalories':
        return tGen('insights.maintenanceCalories', {
          count: signal.count.toLocaleString(),
        })
      case 'trainingStyle':
        return tGen('insights.trainingStyle', {
          style: labels.trainingStyleLabel(signal.style),
        })
      case 'sessionDuration':
        return tGen('insights.sessionDuration', { minutes: signal.minutes })
      default:
        return null
    }
  }

  return (
    <StageLoaderLayout
      progressBar={progressBar}
      logo={
        <BrandLogo
          size="stage"
          variant="logotype"
          glow="hero"
          align="center"
        />
      }
      title={
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[oklch(0.62_0.17_25)]">
            {t('eyebrow')}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            {t('headline')}
          </h2>
        </>
      }
    >
      <div className="w-full rounded-[2rem] border border-border/80 bg-card/75 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur sm:p-6">
            <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span>{t('progressLabel')}</span>
              <span className="tabular-nums">
                {tGen('percent', { percent: Math.round(progress * 100) })}
              </span>
            </div>

            <div className="mb-6 h-1 overflow-hidden rounded-full bg-secondary/80">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[oklch(0.43_0.14_25)] via-[oklch(0.52_0.16_25)] to-[oklch(0.64_0.16_25)] shadow-[0_0_16px_rgba(127,29,29,0.45)]"
                animate={{ width: `${Math.max(progress * 100, 4)}%` }}
                transition={{ duration: 0.55, ease: stepEase }}
              />
            </div>

            <div className="space-y-2.5">
              {PROFILE_ANALYSIS_STAGE_KEYS.map((key, index) => {
                const isComplete = completedSteps.includes(key)
                const isActive = activeStep === key && !isComplete

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: isComplete || isActive ? 1 : 0.38, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35, ease: stepEase }}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-colors',
                      isComplete
                        ? 'border-[oklch(0.52_0.16_25)]/25 bg-[oklch(0.52_0.16_25)]/8'
                        : isActive
                          ? 'border-border bg-background/50'
                          : 'border-border/50 bg-background/20'
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full border transition-all',
                        isComplete
                          ? 'border-[oklch(0.52_0.16_25)] bg-[oklch(0.52_0.16_25)] text-white shadow-[0_0_14px_rgba(127,29,29,0.45)]'
                          : isActive
                            ? 'border-[oklch(0.52_0.16_25)]/60 bg-[oklch(0.52_0.16_25)]/10'
                            : 'border-border bg-secondary/40'
                      )}
                    >
                      {isComplete ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : (
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            isActive
                              ? 'bg-[oklch(0.52_0.16_25)] shadow-[0_0_10px_rgba(127,29,29,0.8)]'
                              : 'bg-muted-foreground/40'
                          )}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm leading-snug',
                        isComplete || isActive
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {tGen(`steps.${key}`)}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={visibleInsightIndex}
                initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: stepEase }}
                className="mt-5 rounded-2xl border border-border/70 bg-gradient-to-br from-white/[0.04] to-transparent px-4 py-3.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {tGen('signalLabel')}
                </p>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground/90">
                  {renderInsight()}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
    </StageLoaderLayout>
  )
}
