'use client'

import { useTranslations } from 'next-intl'

import { resolveOnboardingOptionTranslation } from '@/lib/i18n/resolve-onboarding-translation'
import { ACTIVITY_LEVEL_OPTIONS } from '@/lib/onboarding/activity-level'
import { TRAINING_STYLE_OPTIONS } from '@/lib/onboarding/training-style'
import { WEIGHT_LOSS_PACE_OPTIONS } from '@/lib/onboarding/weight-loss'

function translateOption(
  t: ReturnType<typeof useTranslations<'onboarding.options'>>,
  relativeKey: string
): string {
  return resolveOnboardingOptionTranslation(relativeKey, t(relativeKey as never))
}

export function useOnboardingLabels() {
  const t = useTranslations('onboarding.options')

  return {
    activityLevelLabel: (id: string) =>
      translateOption(t, `activity.${id}.title`),
    activityLevelDescription: (id: string) =>
      translateOption(t, `activity.${id}.description`),
    activityLevels: ACTIVITY_LEVEL_OPTIONS.map((option) => ({
      ...option,
      title: translateOption(t, `activity.${option.id}.title`),
      description: translateOption(t, `activity.${option.id}.description`),
    })),
    experienceLabel: (id: string) =>
      translateOption(t, `experience.${id}.title`),
    experienceDescription: (id: string) =>
      translateOption(t, `experience.${id}.description`),
    goalLabel: (id: string) => translateOption(t, `goal.${id}.title`),
    goalDescription: (id: string) =>
      translateOption(t, `goal.${id}.description`),
    weightLossPaceLabel: (id: string) =>
      translateOption(t, `weightLossPace.${id}.title`),
    weightLossPaceDescription: (id: string) =>
      translateOption(t, `weightLossPace.${id}.description`),
    weightLossPaces: WEIGHT_LOSS_PACE_OPTIONS.map((option) => ({
      ...option,
      title: translateOption(t, `weightLossPace.${option.id}.title`),
      description: translateOption(t, `weightLossPace.${option.id}.description`),
    })),
    trainingStyleLabel: (id: string) =>
      translateOption(t, `trainingStyle.${id}.title`),
    trainingStyleDescription: (id: string) =>
      translateOption(t, `trainingStyle.${id}.description`),
    trainingStyles: TRAINING_STYLE_OPTIONS.map((option) => ({
      ...option,
      title: translateOption(t, `trainingStyle.${option.id}.title`),
      description: translateOption(t, `trainingStyle.${option.id}.description`),
    })),
    muscleGroupLabel: (id: string) =>
      translateOption(t, `muscleGroup.${id}`),
    equipmentLabel: (id: string) => translateOption(t, `equipment.${id}`),
    injuryTitle: (id: string) => translateOption(t, `injury.${id}.title`),
    injuryDescription: (id: string) =>
      translateOption(t, `injury.${id}.description`),
    frequencyLabel: (days: number) =>
      translateOption(t, `frequency.${days}.label`),
    frequencyDescription: (days: number) =>
      translateOption(t, `frequency.${days}.description`),
    durationLabel: (minutes: number) =>
      translateOption(t, `duration.${minutes}.label`),
    durationDescription: (minutes: number) =>
      translateOption(t, `duration.${minutes}.description`),
  }
}
