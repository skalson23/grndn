'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Minus, Plus, Cake } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOnboarding } from '../onboarding-context'

const MIN = 13
const MAX = 100

export function AgeScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const t = useTranslations('onboarding.age')
  const tCommon = useTranslations('common')
  const value = data.age

  return (
    <div className="flex-1 flex flex-col p-6 pb-10 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <button
          type="button"
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
              <Cake className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-center w-full max-w-xs"
        >
          <div className="flex items-center justify-center gap-6 mb-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => updateData({ age: Math.max(MIN, value - 1) })}
              disabled={value <= MIN}
              className={cn(
                'w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all',
                value <= MIN
                  ? 'border-muted text-muted cursor-not-allowed'
                  : 'border-border hover:border-foreground hover:bg-secondary'
              )}
            >
              <Minus className="w-6 h-6" />
            </motion.button>

            <div className="min-w-[5.5rem]">
              <motion.div
                key={value}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="text-6xl font-bold tracking-tight tabular-nums"
              >
                {value}
              </motion.div>
              <p className="text-muted-foreground text-sm mt-1">{t('yearsOld')}</p>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => updateData({ age: Math.min(MAX, value + 1) })}
              disabled={value >= MAX}
              className={cn(
                'w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all',
                value >= MAX
                  ? 'border-muted text-muted cursor-not-allowed'
                  : 'border-border hover:border-foreground hover:bg-secondary'
              )}
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="flex-shrink-0 pt-4">
        <Button
          type="button"
          onClick={goNext}
          disabled={value < MIN || value > MAX}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl disabled:opacity-30"
        >
          {tCommon('continue')}
        </Button>
      </div>
    </div>
  )
}
