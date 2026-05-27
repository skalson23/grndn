import { getActivityMultiplier } from './activity-level'

type TdeeInput = {
  sex: string
  age: number
  heightCm: number
  weightKg: number
  activityLevel: string
}

export type TdeeEstimate = {
  bmr: number
  maintenanceCalories: number
  multiplier: number
}

/** Lightweight Mifflin-St Jeor estimate for coaching context only. */
export function estimateTdee(input: TdeeInput): TdeeEstimate {
  const sexOffset = input.sex === 'female' ? -161 : input.sex === 'male' ? 5 : -78
  const bmr =
    10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + sexOffset
  const multiplier = getActivityMultiplier(input.activityLevel)

  return {
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round((bmr * multiplier) / 10) * 10,
    multiplier,
  }
}
