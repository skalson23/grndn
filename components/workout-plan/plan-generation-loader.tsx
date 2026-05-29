'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { BrandLogo } from '@/components/brand/brand-logo'
import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { Button } from '@/components/ui/button'
import {
  PLAN_GENERATION_STAGE_KEYS,
  type PlanGenerationStageKey,
} from '@/lib/workout-plan/generation-stages'
import { runWorkoutPlanGeneration } from '@/lib/workout-plan/run-generation'
import { cn } from '@/lib/utils'

type PlanGenerationLoaderProps = {
  data: OnboardingData
  onComplete: () => void
  onCancel: () => void
}

export function PlanGenerationLoader({
  data,
  onComplete,
  onCancel,
}: PlanGenerationLoaderProps) {
  const t = useTranslations('generation')
  const tActions = useTranslations('actions')
  const [stageKey, setStageKey] = useState<PlanGenerationStageKey>('analyzing')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    runWorkoutPlanGeneration(data, (p) => {
      setStageKey(p.stageKey)
      setProgress(p.progress)
    })
      .then(() => {
        setProgress(1)
        setTimeout(onComplete, 400)
      })
      .catch((e) => {
        const message = e instanceof Error ? e.message : t('error')
        setError(message)
        toast.error(message)
      })
  }, [data, onComplete, t])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[100] flex min-h-svh flex-col overflow-hidden bg-background text-foreground"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute left-1/2 top-[38%] h-80 w-80 -translate-x-1/2 rounded-full bg-[oklch(0.52_0.16_25)] opacity-[0.14] blur-[100px]" />
        <motion.div
          className="absolute left-1/2 top-[40%] h-56 w-56 -translate-x-1/2 rounded-full border border-white/[0.07] bg-foreground/[0.02] shadow-[0_0_120px_rgba(127,29,29,0.18)]"
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.5, 0.82, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 py-8">
        <div className="flex w-full max-w-md -translate-y-6 flex-col items-center sm:-translate-y-8">
          <BrandLogo
            size="stage"
            variant="logotype"
            glow="hero"
            className="mb-8 items-center sm:mb-9"
          />

          <div className="w-full rounded-[2rem] border border-border/80 bg-card/70 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur sm:p-5">
            <div className="mb-3.5 flex items-center justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-[0.22em]">{t('buildingProtocol')}</span>
              <span className="tabular-nums">{t('percent', { percent: Math.round(progress * 100) })}</span>
            </div>

            <motion.div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[oklch(0.43_0.14_25)] to-[oklch(0.64_0.16_25)] shadow-[0_0_12px_rgba(127,29,29,0.55)]"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.max(progress * 100, 4)}%` }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              />
            </motion.div>

            <div className="mt-6 flex min-h-[3.25rem] items-center justify-center">
              <AnimatePresence mode="wait">
                {error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex w-full flex-col items-center gap-4 text-center"
                  >
                    <p className="text-sm text-destructive text-pretty">{error}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={onCancel}
                    >
                      {tActions('go_back')}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.p
                    key={stageKey}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                    className={cn(
                      'text-center text-lg font-semibold tracking-[-0.02em] text-foreground',
                      'sm:text-xl'
                    )}
                  >
                    {t(`stages.${stageKey}`)}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {!error && (
              <div className="mt-3.5 grid gap-2">
                {PLAN_GENERATION_STAGE_KEYS.map((key, index) => {
                  const isComplete = progress >= (index + 1) / PLAN_GENERATION_STAGE_KEYS.length
                  const isActive = key === stageKey

                  return (
                    <motion.div
                      key={key}
                      initial={false}
                      animate={{
                        opacity: isComplete || isActive ? 1 : 0.42,
                      }}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/35 px-3 py-2.5"
                    >
                      <span
                        className={cn(
                          'size-2 rounded-full transition-colors',
                          isComplete || isActive
                            ? 'bg-[oklch(0.52_0.16_25)] shadow-[0_0_14px_rgba(127,29,29,0.6)]'
                            : 'bg-muted-foreground/30'
                        )}
                      />
                      <span className="text-xs text-muted-foreground">
                        {t(`stages.${key}`)}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {!error && (
        <p className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground/80">
          {t('poweredBy', { frequency: data.frequency })}
        </p>
      )}
    </motion.div>
  )
}
