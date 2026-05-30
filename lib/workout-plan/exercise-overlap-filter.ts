import {
  getExerciseByName,
  isHeavyPressingCompound,
  normalizeExerciseName,
} from '@/lib/exercises'
import type { ExerciseMetadata } from '@/lib/exercises'
import type { AppLocale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

import {
  localizeExerciseName,
  overlapFilterCoachingCue,
} from './exercise-localizations'
import { logWorkoutGeneration } from './generation-log'
import type { WorkoutPlan } from './schema'

type WorkoutSession = WorkoutPlan['weeklySessions'][number]
type WorkoutExercise = WorkoutSession['exercises'][number]

const FALLBACK_HIGH_PRESSING_PATTERNS = [
  /\bbench press\b/i,
  /\bincline .*press\b/i,
  /\bchest press\b/i,
  /\bmachine .*press\b/i,
  /\bshoulder press\b/i,
  /\boverhead press\b/i,
]

const LOW_FATIGUE_PRESSING_REPLACEMENTS = [
  'Cable Fly',
  'Cable Lateral Raise',
  'Cable Pushdown',
] as const

function resolveLocale(locale?: string): AppLocale {
  if (locale && routing.locales.includes(locale as AppLocale)) {
    return locale as AppLocale
  }
  return routing.defaultLocale
}

function isGeneratedHighPressingCompound(name: string): boolean {
  const standardizedName = normalizeExerciseName(name)
  const metadata = getExerciseByName(standardizedName)

  if (metadata) {
    return isHeavyPressingCompound(metadata)
  }

  return FALLBACK_HIGH_PRESSING_PATTERNS.some((pattern) =>
    pattern.test(standardizedName)
  )
}

function replacementFor(
  duplicateName: string,
  usedNames: Set<string>,
  locale: AppLocale
): ExerciseMetadata | null {
  const duplicateMetadata = getExerciseByName(duplicateName)
  const preferred =
    duplicateMetadata?.overlapTags?.includes('shoulder_pressing') ||
    /shoulder|overhead/i.test(duplicateName)
      ? ['Cable Lateral Raise', 'Cable Pushdown', 'Cable Fly']
      : LOW_FATIGUE_PRESSING_REPLACEMENTS

  for (const name of preferred) {
    const displayName = localizeExerciseName(name, locale)
    if (usedNames.has(displayName)) continue
    const replacement = getExerciseByName(name)
    if (replacement) return replacement
  }

  return null
}

function buildReplacementExercise(
  original: WorkoutExercise,
  replacement: ExerciseMetadata,
  locale: AppLocale
): WorkoutExercise {
  const displayName = localizeExerciseName(replacement.name, locale)
  const repsOrDuration =
    locale === 'pl'
      ? replacement.movement_category === 'triceps_isolation'
        ? '10-15 powt.'
        : '12-20 powt.'
      : replacement.movement_category === 'triceps_isolation'
        ? '10-15'
        : '12-20'

  return {
    ...original,
    name: displayName,
    sets: Math.min(original.sets, 3),
    repsOrDuration,
    restSeconds: Math.min(original.restSeconds ?? 60, 75),
    coachingCue:
      replacement.movement_category === 'shoulder_isolation'
        ? overlapFilterCoachingCue(locale, 'shoulderIsolation')
        : overlapFilterCoachingCue(locale, 'genericReplacement'),
  }
}

function sanitizeSessionExercises(
  exercises: WorkoutExercise[],
  locale: AppLocale
): WorkoutExercise[] {
  let hasHighPressingCompound = false
  const usedNames = new Set<string>()

  return exercises.map((exercise) => {
    const matchName = normalizeExerciseName(exercise.name)
    const displayName = exercise.name.trim()

    if (!isGeneratedHighPressingCompound(matchName)) {
      usedNames.add(displayName)
      return exercise
    }

    if (!hasHighPressingCompound) {
      hasHighPressingCompound = true
      usedNames.add(displayName)
      return exercise
    }

    const replacement = replacementFor(matchName, usedNames, locale)
    if (!replacement) {
      usedNames.add(displayName)
      return {
        ...exercise,
        sets: Math.min(exercise.sets, 2),
        restSeconds: Math.min(exercise.restSeconds ?? 60, 75),
        coachingCue: overlapFilterCoachingCue(locale, 'volumeReduced'),
      }
    }

    usedNames.add(localizeExerciseName(replacement.name, locale))
    return buildReplacementExercise(exercise, replacement, locale)
  })
}

export function applyExerciseOverlapFilter(
  plan: WorkoutPlan,
  localeInput?: string
): WorkoutPlan {
  const locale = resolveLocale(localeInput)

  logWorkoutGeneration('overlap_filter_applied', {
    locale,
    sessionCount: plan.weeklySessions.length,
  })

  return {
    ...plan,
    weeklySessions: plan.weeklySessions.map((session) => ({
      ...session,
      exercises: sanitizeSessionExercises(session.exercises, locale),
    })),
  }
}
