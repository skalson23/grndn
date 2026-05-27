import { EXERCISE_DATABASE } from './database'
import { normalizeExerciseName } from './standardization'
import type {
  ExerciseMetadata,
  ExerciseOverlapProfile,
  FatigueRating,
  MovementCategory,
  MuscleGroup,
  SystemicFatigue,
} from './types'

const EXERCISES_BY_ID = new Map(
  EXERCISE_DATABASE.map((exercise) => [exercise.id, exercise])
)

const EXERCISES_BY_NAME = new Map(
  EXERCISE_DATABASE.map((exercise) => [exercise.name, exercise])
)

const FATIGUE_SCORE: Record<FatigueRating | SystemicFatigue, number> = {
  low: 1,
  moderate: 2,
  high: 3,
}

const PRESSING_CATEGORIES: MovementCategory[] = [
  'horizontal_press',
  'incline_press',
  'vertical_press',
]

const HEAVY_ROW_IDS = new Set([
  'barbell_row',
  'chest_supported_row',
  'seated_cable_row',
])

export function getExerciseById(id: string): ExerciseMetadata | undefined {
  return EXERCISES_BY_ID.get(id)
}

export function getExerciseByName(name: string): ExerciseMetadata | undefined {
  return EXERCISES_BY_NAME.get(normalizeExerciseName(name))
}

export function listExercisesByCategory(
  category: MovementCategory
): ExerciseMetadata[] {
  return EXERCISE_DATABASE.filter(
    (exercise) => exercise.movement_category === category
  )
}

export function listExercisesForMuscle(
  muscle: MuscleGroup
): ExerciseMetadata[] {
  return EXERCISE_DATABASE.filter(
    (exercise) =>
      exercise.primary_muscles.includes(muscle) ||
      exercise.secondary_muscles.includes(muscle)
  )
}

export function getOverlapProfile(
  exercise: ExerciseMetadata
): ExerciseOverlapProfile {
  return {
    movement_category: exercise.movement_category,
    direct_muscles: exercise.primary_muscles,
    indirect_muscles: exercise.secondary_muscles,
    fatigue_rating: exercise.fatigue_rating,
    systemic_fatigue: exercise.systemic_fatigue,
  }
}

export function getFatigueScore(exercise: ExerciseMetadata): number {
  return (
    FATIGUE_SCORE[exercise.fatigue_rating] +
    FATIGUE_SCORE[exercise.systemic_fatigue]
  )
}

export function isHeavyPressingCompound(exercise: ExerciseMetadata): boolean {
  if (
    exercise.fatigueClass === 'high_pressing' &&
    exercise.compoundType === 'compound_press'
  ) {
    return true
  }

  return (
    PRESSING_CATEGORIES.includes(exercise.movement_category) &&
    exercise.compoundType !== 'isolation' &&
    (exercise.fatigue_rating === 'high' ||
      exercise.systemic_fatigue === 'high' ||
      Boolean(exercise.overlapTags?.includes('chest_pressing')) ||
      Boolean(exercise.overlapTags?.includes('shoulder_pressing')))
  )
}

export function contributesFrontDeltFatigue(
  exercise: ExerciseMetadata
): boolean {
  return (
    PRESSING_CATEGORIES.includes(exercise.movement_category) ||
    exercise.primary_muscles.includes('front_delts') ||
    exercise.secondary_muscles.includes('front_delts')
  )
}

export function isHeavyRow(exercise: ExerciseMetadata): boolean {
  return (
    HEAVY_ROW_IDS.has(exercise.id) &&
    (exercise.fatigue_rating === 'high' ||
      exercise.systemic_fatigue === 'high' ||
      exercise.primary_muscles.includes('upper_back'))
  )
}

export function shareMovementCategory(
  a: ExerciseMetadata,
  b: ExerciseMetadata
): boolean {
  return a.movement_category === b.movement_category
}

export function getSharedMuscles(
  a: ExerciseMetadata,
  b: ExerciseMetadata
): MuscleGroup[] {
  const aMuscles = new Set([...a.primary_muscles, ...a.secondary_muscles])
  return [...b.primary_muscles, ...b.secondary_muscles].filter((muscle) =>
    aMuscles.has(muscle)
  )
}

/** Placeholder shape for future validators without enforcing rules yet. */
export function getPotentialOverlapFlags(
  exercises: ExerciseMetadata[]
): string[] {
  const flags: string[] = []
  const heavyPresses = exercises.filter(isHeavyPressingCompound)
  const heavyRows = exercises.filter(isHeavyRow)
  const frontDeltContributors = exercises.filter(contributesFrontDeltFatigue)

  if (heavyPresses.length > 1) {
    flags.push('multiple_heavy_pressing_compounds')
  }

  if (heavyRows.length > 1) {
    flags.push('multiple_heavy_rows')
  }

  if (frontDeltContributors.length > 2) {
    flags.push('front_delt_fatigue_overlap')
  }

  return flags
}
