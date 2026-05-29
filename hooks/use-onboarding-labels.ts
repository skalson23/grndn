'use client'

import { useTranslations } from 'next-intl'

import { ACTIVITY_LEVEL_OPTIONS } from '@/lib/onboarding/activity-level'
import { TRAINING_STYLE_OPTIONS } from '@/lib/onboarding/training-style'
import { WEIGHT_LOSS_PACE_OPTIONS } from '@/lib/onboarding/weight-loss'

export function useOnboardingLabels() {
  const t = useTranslations('onboarding.options')

  return {
    activityLevelLabel: (id: string) =>
      t(`activity.${id}.title` as 'activity.sedentary.title'),
    activityLevelDescription: (id: string) =>
      t(`activity.${id}.description` as 'activity.sedentary.description'),
    activityLevels: ACTIVITY_LEVEL_OPTIONS.map((option) => ({
      ...option,
      title: t(`activity.${option.id}.title`),
      description: t(`activity.${option.id}.description`),
    })),
    experienceLabel: (id: string) =>
      t(`experience.${id}.title` as 'experience.beginner.title'),
    experienceDescription: (id: string) =>
      t(`experience.${id}.description` as 'experience.beginner.description'),
    goalLabel: (id: string) =>
      t(`goal.${id}.title` as 'goal.lose-weight.title'),
    goalDescription: (id: string) =>
      t(`goal.${id}.description` as 'goal.lose-weight.description'),
    weightLossPaceLabel: (id: string) =>
      t(`weightLossPace.${id}.title` as 'weightLossPace.aggressive.title'),
    weightLossPaceDescription: (id: string) =>
      t(`weightLossPace.${id}.description` as 'weightLossPace.aggressive.description'),
    weightLossPaces: WEIGHT_LOSS_PACE_OPTIONS.map((option) => ({
      ...option,
      title: t(`weightLossPace.${option.id}.title`),
      description: t(`weightLossPace.${option.id}.description`),
    })),
    trainingStyleLabel: (id: string) =>
      t(`trainingStyle.${id}.title` as 'trainingStyle.hypertrophy.title'),
    trainingStyleDescription: (id: string) =>
      t(`trainingStyle.${id}.description` as 'trainingStyle.hypertrophy.description'),
    trainingStyles: TRAINING_STYLE_OPTIONS.map((option) => ({
      ...option,
      title: t(`trainingStyle.${option.id}.title`),
      description: t(`trainingStyle.${option.id}.description`),
    })),
    muscleGroupLabel: (id: string) =>
      t(`muscleGroup.${id}` as 'muscleGroup.chest'),
    equipmentLabel: (id: string) =>
      t(`equipment.${id}` as 'equipment.none'),
    injuryTitle: (id: string) =>
      t(`injury.${id}.title` as 'injury.none.title'),
    injuryDescription: (id: string) =>
      t(`injury.${id}.description` as 'injury.none.description'),
    frequencyLabel: (days: number) =>
      t(`frequency.${days}.label` as 'frequency.2.label'),
    frequencyDescription: (days: number) =>
      t(`frequency.${days}.description` as 'frequency.2.description'),
    durationLabel: (minutes: number) =>
      t(`duration.${minutes}.label` as 'duration.15.label'),
    durationDescription: (minutes: number) =>
      t(`duration.${minutes}.description` as 'duration.15.description'),
  }
}
