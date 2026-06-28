'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { AppLocale } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { BrandLogo } from '@/components/brand/brand-logo'
import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { Button } from '@/components/ui/button'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { buildAnalysisInsightSignals } from '@/lib/workout-plan/build-plan-analysis'
import {
  PLAN_GENERATION_STAGE_KEYS,
  type PlanGenerationStageKey,
} from '@/lib/workout-plan/generation-stages'
import { runWorkoutPlanGeneration } from '@/lib/workout-plan/run-generation'
import { cn } from '@/lib/utils'

type PlanGenerationLoaderProps = {
  data: OnboardingData
  onComplete: () => void
  onCancel?: () => void
  variant?: 'default' | 'postPayment'
}

const stepEase = [0.32, 0.72, 0, 1] as const

export function PlanGenerationLoader({
  data,
  onComplete,
  onCancel,
  variant = 'default',
}: PlanGenerationLoaderProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations('generation')
  const tPost = useTranslations('assessment.postPayment')
  const tActions = useTranslations('actions')
  const labels = useOnboardingLabels()
  const insightSignals = buildAnalysisInsightSignals(data)

  const [completedSteps, setCompletedSteps] = useState<PlanGenerationStageKey[]>([])
  const [activeStep, setActiveStep] = useState<PlanGenerationStageKey>(
    PLAN_GENERATION_STAGE_KEYS[0]
  )
  const [visibleInsightIndex, setVisibleInsightIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [apiSucceeded, setApiSucceeded] = useState(false)
  const startedRef = useRef(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    cancelledRef.current = false

    runWorkoutPlanGeneration(
      data,
      locale,
      (p) => {
        if (cancelledRef.current) return
        setActiveStep(p.stageKey)
        setProgress(p.progress)
        setCompletedSteps(PLAN_GENERATION_STAGE_KEYS.slice(0, p.stageIndex + 1))
      },
      () => {
        if (cancelledRef.current) return
        setApiSucceeded(true)
      }
    )
      .then(() => {
        if (cancelledRef.current) return
        setProgress(1)
        setCompletedSteps([...PLAN_GENERATION_STAGE_KEYS])
        setTimeout(onComplete, 650)
      })
      .catch((e) => {
        if (cancelledRef.current) return
        cancelledRef.current = true
        const message = e instanceof Error ? e.message : t('error')
        setError(message)
        setProgress(0)
        setCompletedSteps([])
        toast.error(message)
      })

    return () => {
      cancelledRef.current = true
    }
  }, [data, locale, onComplete, t])

  useEffect(() => {
    if (error || insightSignals.length === 0) return

    const interval = window.setInterval(() => {
      setVisibleInsightIndex((current) => (current + 1) % insightSignals.length)
    }, 1400)

    return () => window.clearInterval(interval)
  }, [error, insightSignals.length])

  const showStepComplete = (key: PlanGenerationStageKey) => {
    if (error || !apiSucceeded) return false
    return completedSteps.includes(key)
  }

  const renderInsight = () => {
    const signal = insightSignals[visibleInsightIndex]
    if (!signal) return null

    switch (signal.id) {
      case 'muscleEmphasis':
        return t('insights.muscleEmphasis', {
          muscle: labels.muscleGroupLabel(signal.muscle),
        })
      case 'experienceProfile':
        return t('insights.experienceProfile', {
          level: labels.experienceLabel(signal.level),
        })
      case 'trainingDays':
        return t('insights.trainingDays', { count: signal.count })
      case 'recoveryProfile':
        return t('insights.recoveryProfile')
      case 'maintenanceCalories':
        return t('insights.maintenanceCalories', {
          count: signal.count.toLocaleString(locale === 'pl' ? 'pl-PL' : 'en-US'),
        })
      case 'trainingStyle':
        return t('insights.trainingStyle', {
          style: labels.trainingStyleLabel(signal.style),
        })
      case 'sessionDuration':
        return t('insights.sessionDuration', { minutes: signal.minutes })
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute left-1/2 top-[32%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[oklch(0.52_0.16_25)] opacity-[0.12] blur-[120px]" />
        <motion.div
          className="absolute left-1/2 top-[36%] h-64 w-64 -translate-x-1/2 rounded-full border border-white/[0.08] bg-foreground/[0.02] shadow-[0_0_140px_rgba(127,29,29,0.22)]"
          animate={{ scale: [1, 1.05, 1], opacity: [0.45, 0.78, 0.45] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-10 pt-8 sm:pt-10">
        <div className="flex w-full max-w-lg flex-col items-center">
          <BrandLogo
            size="stage"
            variant="logotype"
            glow="hero"
            className="mb-10 shrink-0 items-center sm:mb-12"
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: stepEase }}
            className="mb-8 w-full text-center"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[oklch(0.62_0.17_25)]">
              {variant === 'postPayment' ? tPost('eyebrow') : t('analysisTitle')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              {variant === 'postPayment' ? tPost('headline') : t('analysisHeadline')}
            </h2>
          </motion.div>

          <div className="w-full rounded-[2rem] border border-border/80 bg-card/75 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur sm:p-6">
            <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span>{t('analysisProgress')}</span>
              <span className="tabular-nums">{t('percent', { percent: Math.round(progress * 100) })}</span>
            </div>

            <div className="mb-6 h-1 overflow-hidden rounded-full bg-secondary/80">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[oklch(0.43_0.14_25)] via-[oklch(0.52_0.16_25)] to-[oklch(0.64_0.16_25)] shadow-[0_0_16px_rgba(127,29,29,0.45)]"
                initial={{ width: '2%' }}
                animate={{ width: `${Math.max(progress * 100, 4)}%` }}
                transition={{ duration: 0.55, ease: stepEase }}
              />
            </div>

            {error ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <p className="text-sm text-destructive">{error}</p>
                {onCancel && (
                  <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>
                    {tActions('go_back')}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {PLAN_GENERATION_STAGE_KEYS.map((key, index) => {
                    const isComplete = showStepComplete(key)
                    const isActive = activeStep === key && !isComplete && !error

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{
                          opacity: isComplete || isActive ? 1 : 0.38,
                          x: 0,
                        }}
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
                            <motion.div
                              initial={{ scale: 0.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                            >
                              <Check className="size-3.5" strokeWidth={3} />
                            </motion.div>
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
                          {t(`steps.${key}`)}
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
                      {t('signalLabel')}
                    </p>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground/90">
                      {renderInsight()}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </div>

      {!error && (
        <p className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-[10px] uppercase tracking-[0.26em] text-muted-foreground/75">
          {t('poweredBy', { frequency: data.frequency })}
        </p>
      )}
    </motion.div>
  )
}
