import { ACTIVITY_LEVEL_OPTIONS } from '@/lib/onboarding/activity-level'
import { TRAINING_STYLE_OPTIONS } from '@/lib/onboarding/training-style'
import { WEIGHT_LOSS_PACE_OPTIONS } from '@/lib/onboarding/weight-loss'

/** Days per week selectable on the frequency step (matches schema min/max). */
export const ONBOARDING_FREQUENCY_DAYS = [1, 2, 3, 4, 5, 6, 7] as const

/** Session lengths offered on the duration step. */
export const ONBOARDING_DURATION_MINUTES = [15, 30, 45, 60, 75, 90] as const

export const ONBOARDING_GOAL_IDS = [
  'lose-weight',
  'build-muscle',
  'get-fit',
  'stay-healthy',
  'compete',
] as const

export const ONBOARDING_EXPERIENCE_IDS = [
  'beginner',
  'intermediate',
  'advanced',
  'elite',
] as const

export const ONBOARDING_EQUIPMENT_IDS = [
  'none',
  'dumbbells',
  'barbell',
  'kettlebell',
  'resistance-bands',
  'pull-up-bar',
  'cable-machine',
  'full-gym',
] as const

export const ONBOARDING_MUSCLE_GROUP_IDS = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'legs',
  'glutes',
  'full-body',
] as const

export const ONBOARDING_INJURY_IDS = [
  'none',
  'lower-back',
  'knees',
  'shoulders',
  'wrists',
  'neck',
  'hips',
  'ankles',
] as const

export const ONBOARDING_ACTIVITY_IDS = ACTIVITY_LEVEL_OPTIONS.map((o) => o.id)
export const ONBOARDING_TRAINING_STYLE_IDS = TRAINING_STYLE_OPTIONS.map((o) => o.id)
export const ONBOARDING_WEIGHT_LOSS_PACE_IDS = WEIGHT_LOSS_PACE_OPTIONS.map(
  (o) => o.id
)

export const ONBOARDING_OPTIONS_NAMESPACE = 'onboarding.options'
