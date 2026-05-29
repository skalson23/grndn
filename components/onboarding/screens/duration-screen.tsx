'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { cn } from '@/lib/utils'
import { useOnboarding } from '../onboarding-context'

const durations = [15, 30, 45, 60, 75, 90]

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
    <div className="flex-1 flex flex-col p-6 pb-10 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{tCommon('back')}</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Clock className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 flex items-center justify-center py-8"
      >
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
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

      <div className="flex-shrink-0 pt-4">
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
