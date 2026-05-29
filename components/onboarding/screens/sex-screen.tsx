'use client'

import { motion } from 'framer-motion'
import { Mars, Venus, Users, CircleSlash, ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { SelectionCard } from '../selection-card'
import { useOnboarding } from '../onboarding-context'

const options = [
  { id: 'male' as const, icon: Mars, titleKey: 'male' as const, hintKey: 'maleHint' as const },
  { id: 'female' as const, icon: Venus, titleKey: 'female' as const, hintKey: 'femaleHint' as const },
  { id: 'non-binary' as const, icon: Users, titleKey: 'nonBinary' as const, hintKey: 'nonBinaryHint' as const },
  {
    id: 'prefer-not-to-say' as const,
    icon: CircleSlash,
    titleKey: 'preferNotToSay' as const,
    hintKey: 'preferNotToSayHint' as const,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function SexScreen() {
  const { data, updateData, goNext, goBack } = useOnboarding()
  const t = useTranslations('onboarding.sex')
  const tCommon = useTranslations('common')
  const value = data.sex

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
        {options.map((opt) => (
          <motion.div key={opt.id} variants={itemVariants}>
            <SelectionCard
              icon={<opt.icon className="w-6 h-6" />}
              title={t(opt.titleKey)}
              description={t(opt.hintKey)}
              selected={value === opt.id}
              onClick={() => updateData({ sex: opt.id })}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex-shrink-0 pt-4">
        <Button
          type="button"
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
