'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { ONBOARDING_DURATION_MINUTES } from '@/lib/i18n/onboarding-message-catalog'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { cn } from '@/lib/utils'
import { useOnboarding } from '../onboarding-context'

const durations = [...ONBOARDING_DURATION_MINUTES]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function DurationScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const t = useTranslations('onboarding.duration')
  const tCommon = useTranslations('common')
  const { durationLabel, durationDescription } = useOnboardingLabels()
  const value = data.duration

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-6 pb-10">
      <div className="flex-shrink-0">
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">{tCommon('back')}</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Clock className="h-5 w-5 text-foreground" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6 py-6"
      >
        <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-4">
          {durations.map((minutes) => {
            const isSelected = value === minutes
            return (
              <motion.button
                key={minutes}
                variants={itemVariants}
                whileTap={{ scale: 0.96 }}
                onClick={() => updateData({ duration: minutes })}
                className={cn(
                  'relative p-6 rounded-2xl border-2 text-center transition-all duration-300',
                  'bg-card hover:bg-secondary/50',
                  isSelected
                    ? 'border-foreground bg-secondary/80'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isSelected ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {durationLabel(minutes)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {durationDescription(minutes)}
                  </p>
                </motion.div>

                {isSelected && (
                  <motion.div
                    layoutId="duration-ring"
                    className="absolute inset-0 rounded-2xl border-2 border-foreground"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <div className="flex-shrink-0 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <Button
          onClick={goNext}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl"
        >
          {tCommon('continue')}
        </Button>
      </div>
    </div>
  )
}
