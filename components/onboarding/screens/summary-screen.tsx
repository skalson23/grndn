'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  Target,
  Award,
  Dumbbell,
  ShieldCheck,
  Zap,
  Calendar,
  Clock,
  Sparkles,
  SlidersHorizontal,
  User2,
  Cake,
  Scale,
  Ruler,
  Activity,
  Goal,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { PlanGenerationLoader } from '@/components/workout-plan/plan-generation-loader'
import { Button } from '@/components/ui/button'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { useRouter } from '@/i18n/navigation'
import { estimateTdee } from '@/lib/onboarding/tdee'
import { cn } from '@/lib/utils'

import { useOnboarding } from '../onboarding-context'

const sexTitleKeys: Record<string, 'male' | 'female' | 'nonBinary' | 'preferNotToSay'> = {
  male: 'male',
  female: 'female',
  'non-binary': 'nonBinary',
  'prefer-not-to-say': 'preferNotToSay',
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function SummaryScreen() {
  const router = useRouter()
  const { data, goBack } = useOnboarding()
  const t = useTranslations('onboarding.summary')
  const tCommon = useTranslations('common')
  const tActions = useTranslations('actions')
  const tSex = useTranslations('onboarding.sex')
  const labels = useOnboardingLabels()
  const [isGenerating, setIsGenerating] = useState(false)

  const getGoalsDisplay = () => {
    if (data.goals.length === 0) return tCommon('notSet')
    if (data.goals.length === 1) return labels.goalLabel(data.goals[0])
    return t('values.goalsCount', { count: data.goals.length })
  }

  const tdee = data.activityLevel ? estimateTdee(data) : null

  const summaryItems = [
    {
      icon: Cake,
      label: t('labels.age'),
      value: t('values.ageYears', { age: data.age }),
    },
    {
      icon: Ruler,
      label: t('labels.height'),
      value: t('values.heightCm', { height: data.heightCm }),
    },
    {
      icon: Scale,
      label: t('labels.weight'),
      value: t('values.weightKg', { weight: data.weightKg }),
    },
    {
      icon: User2,
      label: t('labels.sex'),
      value: data.sex
        ? tSex(sexTitleKeys[data.sex] ?? 'preferNotToSay')
        : '—',
    },
    {
      icon: Activity,
      label: t('labels.dailyActivity'),
      value: data.activityLevel
        ? labels.activityLevelLabel(data.activityLevel)
        : '—',
    },
    ...(tdee
      ? [
          {
            icon: Sparkles,
            label: t('labels.maintenance'),
            value: t('values.maintenanceKcal', {
              count: tdee.maintenanceCalories.toLocaleString(),
            }),
          },
        ]
      : []),
    {
      icon: Award,
      label: t('labels.experience'),
      value: labels.experienceLabel(data.experience),
    },
    { icon: Target, label: t('labels.goals'), value: getGoalsDisplay() },
    ...(data.goals.includes('lose-weight')
      ? [
          {
            icon: Goal,
            label: t('labels.targetWeight'),
            value: data.targetWeightKg
              ? t('values.weightKg', { weight: data.targetWeightKg })
              : '—',
          },
          {
            icon: SlidersHorizontal,
            label: t('labels.fatLossPace'),
            value: data.weightLossPace
              ? labels.weightLossPaceLabel(data.weightLossPace)
              : '—',
          },
        ]
      : []),
    {
      icon: SlidersHorizontal,
      label: t('labels.trainingStyle'),
      value: data.trainingStyle
        ? labels.trainingStyleLabel(data.trainingStyle)
        : '—',
    },
    {
      icon: Dumbbell,
      label: t('labels.equipment'),
      value:
        data.equipment.length === 1 && data.equipment[0] === 'none'
          ? t('values.noEquipment')
          : t('values.itemsCount', { count: data.equipment.length }),
    },
    {
      icon: ShieldCheck,
      label: t('labels.limitations'),
      value:
        data.injuries.length === 1 && data.injuries[0] === 'none'
          ? tCommon('none')
          : t('values.areasCount', { count: data.injuries.length }),
    },
    {
      icon: Zap,
      label: t('labels.focusAreas'),
      value:
        data.muscleGroups.length === 1 && data.muscleGroups[0] === 'full-body'
          ? t('values.fullBody')
          : t('values.groupsCount', { count: data.muscleGroups.length }),
    },
    {
      icon: Calendar,
      label: t('labels.frequency'),
      value: t('values.frequencyDays', { count: data.frequency }),
    },
    {
      icon: Clock,
      label: t('labels.duration'),
      value: t('values.durationMin', { count: data.duration }),
    },
  ]

  return (
    <>
      <AnimatePresence>
        {isGenerating && (
          <PlanGenerationLoader
            data={data}
            onComplete={() => router.push('/results')}
            onCancel={() => setIsGenerating(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 flex-col p-6 pb-10">
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={goBack}
            disabled={isGenerating}
            className="mb-6 flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{tCommon('back')}</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 text-center"
          >
            <div className="mb-6 flex justify-center">
              <BrandLogo size="lg" variant="logotype" glow="soft" className="items-center" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6"
        >
          <motion.div className="space-y-1 rounded-3xl border border-border bg-card p-5">
            {summaryItems.map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="truncate font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </div>
                <span className="shrink-0 text-right font-semibold text-foreground">
                  {item.value}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 rounded-2xl border border-border bg-secondary/50 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground shadow-[0_0_20px_rgba(127,29,29,0.24)]">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm font-medium text-foreground">
                  {t('readyTitle')}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground break-words">
                  {t('readyDescription', {
                    height: data.heightCm,
                    weight: data.weightKg,
                    age: data.age,
                    frequency: data.frequency,
                    duration: data.duration,
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-full flex-shrink-0 space-y-2 pt-6 sm:mx-auto sm:max-w-lg"
        >
          <Button
            type="button"
            onClick={() => setIsGenerating(true)}
            disabled={isGenerating}
            size="lg"
            className={cn(
              'flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl text-base font-semibold tracking-tight',
              'bg-gradient-to-b from-neutral-100 to-neutral-300 text-neutral-950',
              'shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_12px_40px_rgba(0,0,0,0.55)]',
              'border border-white/20 ring-1 ring-black/50',
              'transition-all duration-200 hover:from-white hover:to-neutral-200 active:scale-[0.99]',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            <Sparkles className="size-5 shrink-0" />
            <span>{tActions('generate_plan')}</span>
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t('adjustAnytime')}
          </p>
        </motion.div>
      </div>
    </>
  )
}
