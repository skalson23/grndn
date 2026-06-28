import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { estimateTdee } from '@/lib/onboarding/tdee'
import type { TrainingStyleId } from '@/lib/onboarding/training-style'

export type ProfilePreviewSnapshot = {
  frequencyLabel: string
  primaryGoalLabel: string
  experienceLabel: string
  recoveryLabel: string
  weeklyVolumeLabel: string
  trainingSplitLabel: string
  sessionDurationLabel: string
  previewDayLabels: string[]
}

function resolveSplitRecommendation(
  frequency: number,
  style: string,
  muscleGroups: string[]
): string {
  const trainingStyle = style as TrainingStyleId

  if (trainingStyle === 'full-body' || muscleGroups.includes('full-body')) {
    return 'fullBodyRhythm'
  }
  if (frequency <= 3) {
    return frequency === 2 ? 'twoDayFullBody' : 'threeDaySplit'
  }
  if (frequency === 4) {
    return 'fourDayUpperLower'
  }
  if (frequency >= 5) {
    return trainingStyle === 'strength' ? 'fiveDayStrength' : 'fiveDayHypertrophy'
  }
  return 'adaptiveSplit'
}

function estimateWeeklyVolumeKey(frequency: number, duration: number): string {
  const minutes = frequency * duration
  if (minutes >= 300) return 'high'
  if (minutes >= 210) return 'moderate'
  return 'focused'
}

export function buildProfilePreviewSnapshot(
  profile: OnboardingData,
  labels: {
    goalLabel: (id: string) => string
    experienceLabel: (id: string) => string
    activityLevelLabel: (id: string) => string
    trainingStyleLabel: (id: string) => string
    frequencyDays: (count: number) => string
    durationMin: (count: number) => string
    splitLabel: (key: string) => string
    volumeLabel: (key: string) => string
    recoveryLabel: (key: string) => string
    dayLabel: (index: number) => string
  }
): ProfilePreviewSnapshot {
  const primaryGoal = profile.goals[0] ?? 'general-fitness'
  const splitKey = resolveSplitRecommendation(
    profile.frequency,
    profile.trainingStyle,
    profile.muscleGroups
  )
  const volumeKey = estimateWeeklyVolumeKey(profile.frequency, profile.duration)

  let recoveryKey = 'balanced'
  if (profile.activityLevel) {
    const tdee = estimateTdee(profile)
    if (profile.frequency >= 5) recoveryKey = 'managed'
    else if (tdee && profile.frequency <= 3) recoveryKey = 'strong'
  }

  const previewDayCount = Math.min(Math.max(profile.frequency, 3), 5)

  return {
    frequencyLabel: labels.frequencyDays(profile.frequency),
    primaryGoalLabel: labels.goalLabel(primaryGoal),
    experienceLabel: labels.experienceLabel(profile.experience),
    recoveryLabel: labels.recoveryLabel(recoveryKey),
    weeklyVolumeLabel: labels.volumeLabel(volumeKey),
    trainingSplitLabel: labels.splitLabel(splitKey),
    sessionDurationLabel: labels.durationMin(profile.duration),
    previewDayLabels: Array.from({ length: previewDayCount }, (_, i) =>
      labels.dayLabel(i + 1)
    ),
  }
}
