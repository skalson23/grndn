import {
  getExerciseByName,
  isHeavyPressingCompound,
  normalizeExerciseName,
} from '@/lib/exercises'
import type { ExerciseMetadata } from '@/lib/exercises'

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
  usedNames: Set<string>
): ExerciseMetadata | null {
  const duplicateMetadata = getExerciseByName(duplicateName)
  const preferred =
    duplicateMetadata?.overlapTags?.includes('shoulder_pressing') ||
    /shoulder|overhead/i.test(duplicateName)
      ? ['Cable Lateral Raise', 'Cable Pushdown', 'Cable Fly']
      : LOW_FATIGUE_PRESSING_REPLACEMENTS

  for (const name of preferred) {
    if (usedNames.has(name)) continue
    const replacement = getExerciseByName(name)
    if (replacement) return replacement
  }

  return null
}

function buildReplacementExercise(
  original: WorkoutExercise,
  replacement: ExerciseMetadata
): WorkoutExercise {
  return {
    ...original,
    name: replacement.name,
    sets: Math.min(original.sets, 3),
    repsOrDuration:
      replacement.movement_category === 'triceps_isolation' ? '10-15' : '12-20',
    restSeconds: Math.min(original.restSeconds ?? 60, 75),
    coachingCue:
      replacement.movement_category === 'shoulder_isolation'
        ? 'Low-fatigue accessory work to keep pressing volume recoverable.'
        : 'Low-fatigue accessory chosen to avoid redundant heavy pressing overlap.',
  }
}

function sanitizeSessionExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  let hasHighPressingCompound = false
  const usedNames = new Set<string>()

  return exercises.map((exercise) => {
    const standardizedName = normalizeExerciseName(exercise.name)
    const normalizedExercise = {
      ...exercise,
      name: standardizedName,
    }

    if (!isGeneratedHighPressingCompound(standardizedName)) {
      usedNames.add(standardizedName)
      return normalizedExercise
    }

    if (!hasHighPressingCompound) {
      hasHighPressingCompound = true
      usedNames.add(standardizedName)
      return normalizedExercise
    }

    const replacement = replacementFor(standardizedName, usedNames)
    if (!replacement) {
      usedNames.add(standardizedName)
      return {
        ...normalizedExercise,
        sets: Math.min(normalizedExercise.sets, 2),
        repsOrDuration: normalizedExercise.repsOrDuration || '8-12',
        restSeconds: Math.min(normalizedExercise.restSeconds ?? 60, 75),
        coachingCue:
          'Volume reduced because this movement overlaps with an earlier heavy press.',
      }
    }

    usedNames.add(replacement.name)
    return buildReplacementExercise(normalizedExercise, replacement)
  })
}

export function applyExerciseOverlapFilter(plan: WorkoutPlan): WorkoutPlan {
  return {
    ...plan,
    weeklySessions: plan.weeklySessions.map((session) => ({
      ...session,
      exercises: sanitizeSessionExercises(session.exercises),
    })),
  }
}
