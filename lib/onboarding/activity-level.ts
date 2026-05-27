export const ACTIVITY_LEVEL_IDS = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'athlete_level',
] as const

export type ActivityLevelId = (typeof ACTIVITY_LEVEL_IDS)[number]

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevelId, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  athlete_level: 'Athlete-Level Activity',
}

export const ACTIVITY_LEVEL_OPTIONS: {
  id: ActivityLevelId
  title: string
  description: string
  multiplier: number
}[] = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Mostly sitting, low daily movement.',
    multiplier: 1.2,
  },
  {
    id: 'lightly_active',
    title: 'Lightly Active',
    description: 'Some walking and light daily movement.',
    multiplier: 1.375,
  },
  {
    id: 'moderately_active',
    title: 'Moderately Active',
    description: 'Regular movement and active lifestyle.',
    multiplier: 1.55,
  },
  {
    id: 'very_active',
    title: 'Very Active',
    description: 'Physically demanding work or high daily activity.',
    multiplier: 1.725,
  },
  {
    id: 'athlete_level',
    title: 'Athlete-Level Activity',
    description: 'Very high physical output and recovery demands.',
    multiplier: 1.9,
  },
]

export function getActivityMultiplier(activityLevel: string): number {
  return (
    ACTIVITY_LEVEL_OPTIONS.find((option) => option.id === activityLevel)
      ?.multiplier ?? 1.375
  )
}
