'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  Clock,
  Layers3,
  Library,
  Sparkles,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BrandLogo } from '@/components/brand/brand-logo'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { ExportPdfButton } from '@/components/workout-plan/export-pdf-button'
import { SaveProgramButton } from '@/components/workout-plan/save-program-button'
import { WorkoutSessionCard } from '@/components/workout-plan/workout-session-card'
import { Button } from '@/components/ui/button'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import { Link } from '@/i18n/navigation'
import { estimateTdee } from '@/lib/onboarding/tdee'
import type { TrainingStyleId } from '@/lib/onboarding/training-style'
import { loadResultsPlan } from '@/lib/workout-plan/load-results-plan'
import type { WorkoutPlan } from '@/lib/workout-plan/schema'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export default function ResultsPage() {
  const t = useTranslations('results')
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const tActions = useTranslations('actions')
  const {
    trainingStyleLabel,
    activityLevelLabel,
    muscleGroupLabel,
    experienceLabel,
  } = useOnboardingLabels()

  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [profile, setProfile] = useState<OnboardingData | null>(null)
  const [missing, setMissing] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true

    void loadResultsPlan().then((loaded) => {
      if (!alive) return
      if (!loaded) {
        setMissing(true)
        return
      }
      setPlan(loaded.plan)
      setProfile(loaded.profile)
      setReady(true)
    })

    return () => {
      alive = false
    }
  }, [])

  const sortedSessions = useMemo(() => {
    if (!plan) return []
    return [...plan.weeklySessions].sort((a, b) => a.order - b.order)
  }, [plan])

  const totalWeeklySets = useMemo(() => {
    return sortedSessions.reduce(
      (sum, session) =>
        sum + session.exercises.reduce((sessionSum, ex) => sessionSum + ex.sets, 0),
      0
    )
  }, [sortedSessions])

  const totalWeeklyMinutes = useMemo(() => {
    return sortedSessions.reduce(
      (sum, session) => sum + session.estimatedMinutes,
      0
    )
  }, [sortedSessions])

  const tdee = profile?.activityLevel ? estimateTdee(profile) : null

  const formatEmphasis = (onboardingProfile: OnboardingData | null): string => {
    if (!onboardingProfile || onboardingProfile.muscleGroups.length === 0) {
      return tCommon('balanced')
    }
    if (onboardingProfile.muscleGroups.includes('full-body')) {
      return muscleGroupLabel('full-body')
    }
    return onboardingProfile.muscleGroups
      .slice(0, 2)
      .map((group) => muscleGroupLabel(group))
      .join(' + ')
  }

  if (missing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
        <BrandLogo size="stage" glow="soft" className="mb-10 items-center" />
        <p className="mb-6 max-w-sm text-center text-muted-foreground">
          {t('missingPlan')}
        </p>
        <Button asChild size="lg" className="rounded-2xl">
          <Link href="/">{tActions('back_to_onboarding')}</Link>
        </Button>
      </div>
    )
  }

  if (!plan || !ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6">
        <BrandLogo size="stage" glow="hero" className="items-center" />
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="relative min-h-screen overflow-hidden bg-background pb-20 text-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(127,29,29,0.16),transparent_34%),radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.06),transparent_22%)]"
      />
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" asChild>
              <Link href="/" aria-label={tNav('back')}>
                <ChevronLeft className="size-5" />
              </Link>
            </Button>
            <BrandLogo
              size="nav"
              variant="horizontal"
              glow="soft"
              className="shrink-0 items-center"
            />
          </div>

          <div className="min-w-0 flex-1 basis-0 px-0.5 sm:px-1">
            <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t('your_protocol')}
            </p>
            <h1 className="truncate text-base font-semibold leading-tight tracking-tight lg:truncate-none sm:text-lg">
              {plan.planTitle}
            </h1>
          </div>

          <div className="hidden shrink-0 flex-nowrap items-center gap-2 lg:flex lg:gap-2.5">
            <LanguageSwitcher className="shrink-0" />
            <Button
              variant="outline"
              size="icon"
              className="size-11 shrink-0 rounded-2xl border-border bg-card/80"
              asChild
            >
              <Link href="/my-programs" aria-label={tNav('myPrograms')}>
                <Library className="size-4" />
              </Link>
            </Button>
            <ExportPdfButton
              plan={plan}
              profile={profile}
              className="shrink-0 whitespace-nowrap"
            />
            <SaveProgramButton
              plan={plan}
              profile={profile}
              className="shrink-0 whitespace-nowrap"
            />
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pt-8">
        <div className="grid grid-cols-1 gap-3 lg:hidden">
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>
          <SaveProgramButton plan={plan} profile={profile} className="w-full" />
          <div className="grid grid-cols-2 gap-3">
            <ExportPdfButton plan={plan} profile={profile} className="w-full" />
            <Button
              variant="outline"
              className="h-11 rounded-2xl border-border bg-card/80"
              asChild
            >
              <Link href="/my-programs">
                <Library className="size-4" />
                {t('my_programs')}
              </Link>
            </Button>
          </div>
        </div>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
          className="flex flex-col gap-4"
        >
          <div className="flex justify-center sm:justify-start">
            <BrandLogo size="md" variant="horizontal" glow="soft" className="items-center sm:items-start" />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/80 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="border-b border-border/70 bg-gradient-to-b from-white/[0.07] to-transparent p-5 sm:p-7">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[oklch(0.52_0.16_25)]/30 bg-[oklch(0.52_0.16_25)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.62_0.17_25)]">
                <Sparkles className="size-3" />
                {t('overview')}
              </p>
              <h2 className="text-2xl font-semibold leading-[1.08] tracking-[-0.03em] break-words sm:text-4xl">
                {plan.planTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground break-words sm:text-[15px]">
                {plan.planSummary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-border/70 sm:grid-cols-4">
              {[
                {
                  icon: CalendarDays,
                  label: t('frequency'),
                  value: t('daysPerWeek', { count: sortedSessions.length }),
                },
                {
                  icon: Clock,
                  label: t('duration'),
                  value: t('approxMin', {
                    count: Math.round(totalWeeklyMinutes / sortedSessions.length),
                  }),
                },
                {
                  icon: Activity,
                  label: t('weeklyVolume'),
                  value: t('setsCount', { count: totalWeeklySets }),
                },
                {
                  icon: Layers3,
                  label: t('split'),
                  value: t('dayProtocol', { count: sortedSessions.length }),
                },
              ].map((item) => (
                <div key={item.label} className="bg-card/95 p-4">
                  <item.icon className="mb-3 size-4 text-[oklch(0.52_0.16_25)]" />
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {profile && (
              <div className="flex flex-wrap gap-2 p-5 pt-4 sm:p-6">
                {[
                  t('style', {
                    value: trainingStyleLabel(profile.trainingStyle as TrainingStyleId),
                  }),
                  t('emphasis', { value: formatEmphasis(profile) }),
                  t('activity', {
                    value: activityLevelLabel(profile.activityLevel),
                  }),
                  tdee
                    ? t('maintenance', { count: tdee.maintenanceCalories })
                    : '',
                  t('experience', {
                    value: experienceLabel(profile.experience),
                  }),
                ]
                  .filter(Boolean)
                  .map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {label}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.12 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('workout_split')}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {t('training_week', { count: sortedSessions.length })}
              </h2>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {t('sessionsCount', { count: sortedSessions.length })}
            </span>
          </div>
          <div className="flex flex-col gap-5">
            {sortedSessions.map((session, index) => (
              <motion.div
                key={session.order}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15 + index * 0.06,
                  duration: 0.45,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <WorkoutSessionCard session={session} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-border border-l-[3px] border-l-[oklch(0.52_0.16_25)] bg-card/60 p-5 sm:p-6"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('progression')}
          </p>
          <p className="text-sm leading-relaxed text-foreground/90 break-words">
            {plan.progressionInstructions}
          </p>
        </motion.section>

        {plan.safetyNotes != null && plan.safetyNotes !== '' && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            className="rounded-3xl border border-destructive/25 bg-destructive/5 p-5 sm:p-6"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-destructive">
              {t('notes')}
            </p>
            <p className="text-sm leading-relaxed break-words">{plan.safetyNotes}</p>
          </motion.section>
        )}
      </main>
    </motion.div>
  )
}
