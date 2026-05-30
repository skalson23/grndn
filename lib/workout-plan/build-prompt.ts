import type { AppLocale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import { estimateTdee } from '@/lib/onboarding/tdee'

import { getLanguageRules, getLocaleReminder } from './prompt-language'
import {
  formatPromptProfileContext,
  getPromptActivityLabel,
  getPromptSexLabel,
  getPromptTrainingStyleLabel,
  getPromptWeightLossPaceLabel,
} from './prompt-labels'
import { buildSystemPrompt } from './prompts'
import { buildTrainingStyleRules } from './prompts/training-style-rules'
import type { OnboardingAnswers } from './schema'
import { logWorkoutGeneration } from './generation-log'

function resolveLocale(locale?: string): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale
}

function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  if (m <= 0) return 0
  return Math.round((weightKg / (m * m)) * 10) / 10
}

function buildHardRequirements(
  input: OnboardingAnswers,
  locale: AppLocale
): string {
  return [
    'Hard requirements:',
    `- weeklySessions must contain exactly ${input.frequency} sessions (user trains ${input.frequency} day(s) per week).`,
    `- Each session estimatedMinutes should be close to ${input.duration} minutes (within ~10 minutes).`,
    '- Respect equipment: only prescribe exercises the user can perform with their listed equipment.',
    '- Respect injuries/limitations: avoid or substitute contraindicated movements; set safetyNotes to a short string or null when relevant.',
    '- Calibrate volume and complexity to experience level.',
    '- Align session focuses with stated goals and muscle group priorities when possible.',
    `- Apply training style "${getPromptTrainingStyleLabel(locale, input.trainingStyle)}" across exercise selection, volume, intensity, session structure, and fatigue management.`,
  ].join('\n')
}

function buildAnthropometricsSection(
  input: OnboardingAnswers,
  locale: AppLocale
): string {
  const bmiValue = bmi(input.weightKg, input.heightCm)
  const tdee = estimateTdee(input)

  return [
    'Body profile, activity & programming context (use responsibly, evidence-based only):',
    `- Age ${input.age} years: adjust recovery expectations, joint-friendly options for older adults, and progression conservatism for youth vs masters as appropriate.`,
    `- Height ${input.heightCm} cm, weight ${input.weightKg} kg (BMI ~${bmiValue}): scale ranges of motion, leverage, and conditioning density sensibly; never shame body size.`,
    `- Sex / identity field "${getPromptSexLabel(locale, input.sex)}": where physiology may matter for programming, use inclusive language; if prefer-not-to-say, keep prescriptions neutral and broadly applicable.`,
    `- Daily activity level: ${getPromptActivityLabel(locale, input.activityLevel)}. Account for non-gym fatigue and recovery demands.`,
    `- Estimated maintenance energy: ~${tdee.maintenanceCalories} kcal/day (BMR ~${tdee.bmr}). This is informational only; do not prescribe macros, meal plans, or calorie tracking.`,
  ].join('\n')
}

function buildWeightLossContext(
  input: OnboardingAnswers,
  locale: AppLocale
): string | null {
  if (!input.goals.includes('lose-weight')) return null

  return [
    'Weight-loss coaching context:',
    `- Target weight: ${input.targetWeightKg ?? 'not provided'} kg.`,
    `- Preferred pace: ${
      input.weightLossPace
        ? getPromptWeightLossPaceLabel(locale, input.weightLossPace)
        : 'not provided'
    }.`,
    '- If pace is aggressive or daily activity is high, reduce junk volume and avoid excessive systemic fatigue.',
    '- Prioritize recoverable strength retention, sustainable conditioning density, and joint-friendly exercise selection.',
    '- Do not create meal plans, macros, or explicit calorie prescriptions.',
  ].join('\n')
}

export function buildWorkoutPlanSystemPrompt(localeInput?: string): string {
  const locale = resolveLocale(localeInput)
  const languageRules = getLanguageRules(locale)

  logWorkoutGeneration('prompt_system_built', {
    locale,
    languageRulesPreview: languageRules.slice(0, 120),
  })

  return [
    languageRules,
    '',
    buildSystemPrompt(),
    '',
    languageRules,
  ].join('\n\n')
}

/** @deprecated Use buildWorkoutPlanSystemPrompt(locale) per request. */
export const WORKOUT_PLAN_SYSTEM_PROMPT = buildWorkoutPlanSystemPrompt('en')

export function buildWorkoutPlanUserMessage(
  input: OnboardingAnswers,
  localeInput?: string
): string {
  const locale = resolveLocale(localeInput)
  const languageRules = getLanguageRules(locale)

  logWorkoutGeneration('prompt_user_built', {
    locale,
    frequency: input.frequency,
    languageRulesPreview: languageRules.slice(0, 120),
  })

  return [
    `Request locale: ${locale}`,
    '',
    languageRules,
    '',
    'Create a one-week strength and conditioning microcycle as JSON matching the provided schema.',
    '',
    buildHardRequirements(input, locale),
    '',
    buildAnthropometricsSection(input, locale),
    '',
    buildWeightLossContext(input, locale),
    '',
    formatPromptProfileContext(locale, input),
    '',
    buildTrainingStyleRules(input.trainingStyle),
    '',
    'User profile (JSON):',
    JSON.stringify(input, null, 2),
    '',
    getLocaleReminder(locale),
  ]
    .filter(Boolean)
    .join('\n')
}
