'use client'

import { motion } from 'framer-motion'
import { Activity, Dumbbell, Sparkles } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { useOnboarding } from '../onboarding-context'

export function WelcomeScreen() {
  const { goNext } = useOnboarding()
  const { t } = useTranslation()

  const features = [
    { icon: Sparkles, label: t('welcome.feature_ai_plans') },
    { icon: Activity, label: t('welcome.feature_adaptive') },
    { icon: Dumbbell, label: t('welcome.feature_pro_results') },
  ]

  return (
    <div className="flex-1 flex flex-col justify-between p-6 pb-10">
      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="relative -mt-2 mb-2 flex w-full max-w-lg justify-center sm:-mt-4 sm:mb-0"
        >
          <BrandLogo
            size="stage"
            variant="logotype"
            glow="cinematic"
            className="relative z-[1] items-center"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-[2] -mt-6 sm:-mt-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-balance">
            {t('welcome.headline_line_1')}
            <br />
            <span className="text-muted-foreground">
              {t('welcome.headline_line_2')}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto text-pretty">
            {t('welcome.subtitle')}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex items-center justify-center gap-6 mt-10"
        >
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {feature.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Button
          onClick={goNext}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl"
        >
          {t('actions.get_started')}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          {t('welcome.setup_time')}
        </p>
      </motion.div>
    </div>
  )
}
