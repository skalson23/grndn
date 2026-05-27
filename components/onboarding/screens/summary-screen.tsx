'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

import { BrandLogo } from '@/components/brand/brand-logo'
import { PlanGenerationLoader } from '@/components/workout-plan/plan-generation-loader'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { TRAINING_STYLE_LABELS } from '@/lib/onboarding/training-style'
import { ACTIVITY_LEVEL_LABELS } from '@/lib/onboarding/activity-level'
import { estimateTdee } from '@/lib/onboarding/tdee'
import { WEIGHT_LOSS_PACE_LABELS } from '@/lib/onboarding/weight-loss'

import { useOnboarding } from '../onboarding-context'

const goalLabels: Record<string, string> = {
  'lose-weight': 'Lose Weight',
  'build-muscle': 'Build Muscle',
  'get-fit': 'Get Fit',
  'stay-healthy': 'Stay Healthy',
  compete: 'Compete',
}

const experienceLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
}

const sexLabels: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  'non-binary': 'Non-binary',
  'prefer-not-to-say': 'Prefer not to say',
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
  const { t } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)

  const getGoalsDisplay = () => {
    if (data.goals.length === 0) return 'Not set'
    if (data.goals.length === 1) return goalLabels[data.goals[0]] || data.goals[0]
    return `${data.goals.length} goals`
  }
  const tdee = data.activityLevel
    ? estimateTdee(data)
    : null

  const summaryItems = [
    { icon: Cake, label: 'Age', value: `${data.age} yrs` },
    { icon: Ruler, label: 'Height', value: `${data.heightCm} cm` },
    { icon: Scale, label: 'Weight', value: `${data.weightKg} kg` },
    { icon: User2, label: 'Sex', value: sexLabels[data.sex] || data.sex || '—' },
    {
      icon: Activity,
      label: 'Daily activity',
      value:
        ACTIVITY_LEVEL_LABELS[
          data.activityLevel as keyof typeof ACTIVITY_LEVEL_LABELS
        ] || data.activityLevel || '—',
    },
    ...(tdee
      ? [
          {
            icon: Sparkles,
            label: 'Maintenance',
            value: `~${tdee.maintenanceCalories.toLocaleString()} kcal`,
          },
        ]
      : []),
    {
      icon: Award,
      label: 'Experience',
      value: experienceLabels[data.experience] || data.experience,
    },
    { icon: Target, label: 'Goals', value: getGoalsDisplay() },
    ...(data.goals.includes('lose-weight')
      ? [
          {
            icon: Goal,
            label: 'Target weight',
            value: data.targetWeightKg ? `${data.targetWeightKg} kg` : '—',
          },
          {
            icon: SlidersHorizontal,
            label: 'Fat-loss pace',
            value:
              WEIGHT_LOSS_PACE_LABELS[
                data.weightLossPace as keyof typeof WEIGHT_LOSS_PACE_LABELS
              ] || data.weightLossPace || '—',
          },
        ]
      : []),
    {
      icon: SlidersHorizontal,
      label: 'Training style',
      value:
        TRAINING_STYLE_LABELS[
          data.trainingStyle as keyof typeof TRAINING_STYLE_LABELS
        ] || data.trainingStyle || '—',
    },
    {
      icon: Dumbbell,
      label: 'Equipment',
      value:
        data.equipment.length === 1 && data.equipment[0] === 'none'
          ? 'No Equipment'
          : `${data.equipment.length} items`,
    },
    {
      icon: ShieldCheck,
      label: 'Limitations',
      value:
        data.injuries.length === 1 && data.injuries[0] === 'none'
          ? 'None'
          : `${data.injuries.length} areas`,
    },
    {
      icon: Zap,
      label: 'Focus Areas',
      value:
        data.muscleGroups.length === 1 && data.muscleGroups[0] === 'full-body'
          ? 'Full Body'
          : `${data.muscleGroups.length} groups`,
    },
    { icon: Calendar, label: 'Frequency', value: `${data.frequency} days/week` },
    { icon: Clock, label: 'Duration', value: `${data.duration} min` },
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
            <span className="text-sm font-medium">Back</span>
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
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              You&apos;re all set
            </h1>
            <p className="text-muted-foreground">
              Review your profile, then generate your GRNDN protocol.
            </p>
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
                  Ready for your protocol
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground break-words">
                  Metrics ({data.heightCm} cm, {data.weightKg} kg, age {data.age})
                  plus your {data.frequency}-day schedule shape a{' '}
                  {data.duration}-minute adaptive plan.
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
            <span>{t('actions.generate_plan')}</span>
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            You can adjust these settings anytime
          </p>
        </motion.div>
      </div>
    </>
  )
}
