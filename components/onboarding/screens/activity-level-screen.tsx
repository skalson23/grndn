'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  ChevronLeft,
  Footprints,
  PersonStanding,
  Rocket,
  Sofa,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { type ActivityLevelId } from '@/lib/onboarding/activity-level'
import { estimateTdee } from '@/lib/onboarding/tdee'

import { SelectionCard } from '../selection-card'
import { useOnboarding } from '../onboarding-context'

const icons: Record<ActivityLevelId, typeof Sofa> = {
  sedentary: Sofa,
  lightly_active: Footprints,
  moderately_active: PersonStanding,
  very_active: Briefcase,
  athlete_level: Rocket,
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export function ActivityLevelScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const t = useTranslations('onboarding.activity')
  const tCommon = useTranslations('common')
  const { activityLevels } = useOnboardingLabels()
  const value = data.activityLevel
  const estimate = value
    ? estimateTdee({
        sex: data.sex,
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        activityLevel: value,
      })
    : null

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-6 pb-10">
      <div className="flex-shrink-0">
        <button
          type="button"
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
        <div className="space-y-3">
          {activityLevels.map((option) => {
            const Icon = icons[option.id]
            return (
              <motion.div key={option.id} variants={itemVariants}>
                <SelectionCard
                  icon={<Icon className="h-6 w-6" />}
                  title={option.title}
                  description={option.description}
                  selected={value === option.id}
                  onClick={() => updateData({ activityLevel: option.id })}
                />
              </motion.div>
            )
          })}
        </div>

        {estimate && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-3xl border border-border bg-secondary/40 p-5"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-[oklch(0.52_0.16_25)]">
              {t('maintenanceEstimate')}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {t('kcalPerDay', { count: estimate.maintenanceCalories.toLocaleString() })}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('disclaimer')}
            </p>
          </motion.div>
        )}
      </motion.div>

      <div className="flex-shrink-0 pt-4">
        <Button
          type="button"
          onClick={goNext}
          disabled={!value}
          size="lg"
          className="h-14 w-full rounded-2xl text-lg font-semibold disabled:opacity-30"
        >
          {tCommon('continue')}
        </Button>
      </div>
    </div>
  )
}
