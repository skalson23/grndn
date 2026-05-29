'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const t = useTranslations('onboarding.progress')
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="relative w-full px-6 pt-6 pb-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
          {t('stepOf', { current: currentStep, total: totalSteps })}
        </span>
        <span className="text-xs font-medium text-[oklch(0.62_0.17_25)]">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1 w-full bg-secondary/80 rounded-full overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[oklch(0.38_0.12_25)] via-[oklch(0.52_0.16_25)] to-[oklch(0.66_0.16_25)] shadow-[0_0_18px_rgba(127,29,29,0.55)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>
    </div>
  )
}
