'use client'

import { motion } from 'framer-motion'
import { Baby, User, Award, Crown, ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { SelectionCard } from '../selection-card'
import { useOnboarding } from '../onboarding-context'

const experiences = [
  { id: 'beginner', icon: Baby },
  { id: 'intermediate', icon: User },
  { id: 'advanced', icon: Award },
  { id: 'elite', icon: Crown },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function ExperienceScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const t = useTranslations('onboarding.experience')
  const tCommon = useTranslations('common')
  const { experienceLabel, experienceDescription } = useOnboardingLabels()
  const value = data.experience

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
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 min-h-0 overflow-y-auto py-6 -mx-6 px-6 space-y-3"
      >
        {experiences.map((exp) => (
          <motion.div key={exp.id} variants={itemVariants}>
            <SelectionCard
              icon={<exp.icon className="w-6 h-6" />}
              title={experienceLabel(exp.id)}
              description={experienceDescription(exp.id)}
              selected={value === exp.id}
              onClick={() => updateData({ experience: exp.id })}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex-shrink-0 pt-4">
        <Button
          onClick={goNext}
          disabled={!value}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl disabled:opacity-30"
        >
          {tCommon('continue')}
        </Button>
      </div>
    </div>
  )
}
