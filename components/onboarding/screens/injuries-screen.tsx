'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Check, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { cn } from '@/lib/utils'
import { useOnboarding } from '../onboarding-context'

const injuries = [
  { id: 'none' },
  { id: 'lower-back' },
  { id: 'knees' },
  { id: 'shoulders' },
  { id: 'wrists' },
  { id: 'neck' },
  { id: 'hips' },
  { id: 'ankles' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

export function InjuriesScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const t = useTranslations('onboarding.injuries')
  const tCommon = useTranslations('common')
  const { injuryTitle, injuryDescription } = useOnboardingLabels()
  const value = data.injuries

  const toggleInjury = (id: string) => {
    if (id === 'none') {
      updateData({ injuries: value.includes('none') ? [] : ['none'] })
    } else {
      const withoutNone = value.filter((v) => v !== 'none')
      if (withoutNone.includes(id)) {
        updateData({ injuries: withoutNone.filter((v) => v !== id) })
      } else {
        updateData({ injuries: [...withoutNone, id] })
      }
    }
  }

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
              <ShieldCheck className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            </div>
          </div>
          <p className="text-muted-foreground">{t('description')}</p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 min-h-0 overflow-y-auto py-6 -mx-6 px-6 space-y-2"
      >
        {injuries.map((injury) => {
          const isSelected = value.includes(injury.id)
          return (
            <motion.button
              key={injury.id}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleInjury(injury.id)}
              className={cn(
                'relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between',
                'bg-card hover:bg-secondary/50',
                isSelected
                  ? 'border-foreground bg-secondary/80'
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <div>
                <span className="font-semibold text-foreground">
                  {injuryTitle(injury.id)}
                </span>
                <p className="text-sm text-muted-foreground">
                  {injuryDescription(injury.id)}
                </p>
              </div>

              <motion.div
                initial={false}
                animate={{
                  scale: isSelected ? 1 : 0.8,
                  opacity: isSelected ? 1 : 0.3,
                }}
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-foreground border-foreground'
                    : 'border-muted-foreground/50'
                )}
              >
                {isSelected && <Check className="w-4 h-4 text-background" />}
              </motion.div>
            </motion.button>
          )
        })}
      </motion.div>

      <div className="flex-shrink-0 pt-4 pb-safe">
        <Button
          onClick={goNext}
          disabled={value.length === 0}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl disabled:opacity-30"
        >
          {tCommon('continue')}
        </Button>
      </div>
    </div>
  )
}
