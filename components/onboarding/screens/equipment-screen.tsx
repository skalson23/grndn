'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { cn } from '@/lib/utils'
import { useOnboarding } from '../onboarding-context'

const equipment = [
  { id: 'none', emoji: '🏃' },
  { id: 'dumbbells', emoji: '🏋️' },
  { id: 'barbell', emoji: '💪' },
  { id: 'kettlebell', emoji: '⚡' },
  { id: 'resistance-bands', emoji: '🔥' },
  { id: 'pull-up-bar', emoji: '🎯' },
  { id: 'cable-machine', emoji: '⚙️' },
  { id: 'full-gym', emoji: '🏆' },
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
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
}

export function EquipmentScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const t = useTranslations('onboarding.equipment')
  const tCommon = useTranslations('common')
  const { equipmentLabel } = useOnboardingLabels()
  const value = data.equipment

  const toggleEquipment = (id: string) => {
    if (id === 'none') {
      updateData({ equipment: value.includes('none') ? [] : ['none'] })
    } else {
      const withoutNone = value.filter((v) => v !== 'none')
      if (withoutNone.includes(id)) {
        updateData({ equipment: withoutNone.filter((v) => v !== id) })
      } else {
        updateData({ equipment: [...withoutNone, id] })
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 min-h-0 overflow-y-auto py-6 -mx-6 px-6"
      >
        <div className="grid grid-cols-2 gap-3">
          {equipment.map((item) => {
            const isSelected = value.includes(item.id)
            return (
              <motion.button
                key={item.id}
                variants={itemVariants}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleEquipment(item.id)}
                className={cn(
                  'relative p-4 rounded-2xl border-2 text-left transition-all duration-300',
                  'bg-card hover:bg-secondary/50',
                  isSelected
                    ? 'border-foreground bg-secondary/80'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isSelected ? 1 : 0,
                    opacity: isSelected ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-foreground flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-background" />
                </motion.div>

                <div className="text-2xl mb-2">{item.emoji}</div>
                <span className="text-sm font-medium text-foreground">
                  {equipmentLabel(item.id)}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <div className="flex-shrink-0 pt-4">
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
