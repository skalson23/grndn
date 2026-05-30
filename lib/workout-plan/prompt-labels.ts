import type { AppLocale } from '@/i18n/routing'

import { getPromptCatalog } from './prompt-language'
import type { OnboardingAnswers } from './schema'

export function getPromptActivityLabel(
  locale: AppLocale,
  activityLevel: string
): string {
  const options = getPromptCatalog(locale).onboarding.options.activity
  const entry = options[activityLevel as keyof typeof options]
  return entry?.title ?? activityLevel
}

export function getPromptTrainingStyleLabel(
  locale: AppLocale,
  trainingStyle: string
): string {
  const options = getPromptCatalog(locale).onboarding.options.trainingStyle
  const entry = options[trainingStyle as keyof typeof options]
  return entry?.title ?? trainingStyle
}

export function getPromptWeightLossPaceLabel(
  locale: AppLocale,
  pace: string
): string {
  if (!pace) return pace
  const options = getPromptCatalog(locale).onboarding.options.weightLossPace
  const entry = options[pace as keyof typeof options]
  return entry?.title ?? pace
}

export function getPromptExperienceLabel(
  locale: AppLocale,
  experience: string
): string {
  const options = getPromptCatalog(locale).onboarding.options.experience
  const entry = options[experience as keyof typeof options]
  return entry?.title ?? experience
}

export function getPromptGoalLabels(
  locale: AppLocale,
  goals: string[]
): string[] {
  const options = getPromptCatalog(locale).onboarding.options.goal
  return goals.map(
    (goal) => options[goal as keyof typeof options]?.title ?? goal
  )
}

export function getPromptSexLabel(locale: AppLocale, sex: string): string {
  const sexLabels = getPromptCatalog(locale).onboarding.sex
  const map: Record<string, string> = {
    male: sexLabels.male,
    female: sexLabels.female,
    'non-binary': sexLabels.nonBinary,
    'prefer-not-to-say': sexLabels.preferNotToSay,
  }
  return map[sex] ?? sex
}

export function formatPromptProfileContext(
  locale: AppLocale,
  input: OnboardingAnswers
): string {
  const catalog = getPromptCatalog(locale)
  const goals = getPromptGoalLabels(locale, input.goals).join(', ')

  return [
    `${catalog.onboarding.summary.labels.goals}: ${goals}`,
    `${catalog.onboarding.summary.labels.trainingStyle}: ${getPromptTrainingStyleLabel(locale, input.trainingStyle)}`,
    `${catalog.onboarding.summary.labels.dailyActivity}: ${getPromptActivityLabel(locale, input.activityLevel)}`,
    `${catalog.onboarding.summary.labels.experience}: ${getPromptExperienceLabel(locale, input.experience)}`,
  ].join('\n')
}
