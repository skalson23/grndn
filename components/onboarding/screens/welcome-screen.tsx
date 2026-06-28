'use client'

import { motion } from 'framer-motion'
import { Activity, Dumbbell, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '../onboarding-context'

export function WelcomeScreen() {
  const { goNext } = useOnboarding()
  const t = useTranslations('welcome')
  const tActions = useTranslations('actions')

  const features = [
    { icon: Sparkles, label: t('feature_ai_plans') },
    { icon: Activity, label: t('feature_adaptive') },
    { icon: Dumbbell, label: t('feature_pro_results') },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="mb-8 flex w-full max-w-lg shrink-0 justify-center sm:mb-10"
        >
          <BrandLogo
            size="stage"
            variant="logotype"
            glow="cinematic"
            className="items-center"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {t('headline_line_1')}
            <br />
            <span className="text-muted-foreground">{t('headline_line_2')}</span>
          </h1>
          <p className="mx-auto max-w-sm text-pretty text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 flex items-center justify-center gap-6"
        >
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
                <feature.icon className="size-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {feature.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <Button
          onClick={goNext}
          size="lg"
          className="h-14 w-full rounded-2xl text-lg font-semibold"
        >
          {tActions('get_started')}
        </Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t('setup_time')}
        </p>
      </motion.div>
    </div>
  )
}
