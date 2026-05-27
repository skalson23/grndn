import { ACTIVITY_LEVEL_LABELS } from '@/lib/onboarding/activity-level'
import { estimateTdee } from '@/lib/onboarding/tdee'
import { TRAINING_STYLE_LABELS } from '@/lib/onboarding/training-style'
import { WEIGHT_LOSS_PACE_LABELS } from '@/lib/onboarding/weight-loss'

import { buildSystemPrompt } from './prompts'
import { buildTrainingStyleRules } from './prompts/training-style-rules'
import type { OnboardingAnswers } from './schema'

function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  if (m <= 0) return 0
  return Math.round((weightKg / (m * m)) * 10) / 10
}

function buildHardRequirements(input: OnboardingAnswers): string {
  return [
    'Hard requirements:',
    `- weeklySessions must contain exactly ${input.frequency} sessions (user trains ${input.frequency} day(s) per week).`,
    `- Each session estimatedMinutes should be close to ${input.duration} minutes (within ~10 minutes).`,
    '- Respect equipment: only prescribe exercises the user can perform with their listed equipment.',
    '- Respect injuries/limitations: avoid or substitute contraindicated movements; set safetyNotes to a short string or null when relevant.',
    '- Calibrate volume and complexity to experience level.',
    '- Align session focuses with stated goals and muscle group priorities when possible.',
    `- Apply training style "${TRAINING_STYLE_LABELS[input.trainingStyle]}" across exercise selection, volume, intensity, session structure, and fatigue management.`,
  ].join('\n')
}

function buildAnthropometricsSection(input: OnboardingAnswers): string {
  const bmiValue = bmi(input.weightKg, input.heightCm)
  const tdee = estimateTdee(input)

  return [
    'Body profile, activity & programming context (use responsibly, evidence-based only):',
    `- Age ${input.age} years: adjust recovery expectations, joint-friendly options for older adults, and progression conservatism for youth vs masters as appropriate.`,
    `- Height ${input.heightCm} cm, weight ${input.weightKg} kg (BMI ~${bmiValue}): scale ranges of motion, leverage, and conditioning density sensibly; never shame body size.`,
    `- Sex / identity field "${input.sex}": where physiology may matter for programming, use inclusive language; if "prefer-not-to-say", keep prescriptions neutral and broadly applicable.`,
    `- Daily activity level: ${ACTIVITY_LEVEL_LABELS[input.activityLevel]}. Account for non-gym fatigue and recovery demands.`,
    `- Estimated maintenance energy: ~${tdee.maintenanceCalories} kcal/day (BMR ~${tdee.bmr}). This is informational only; do not prescribe macros, meal plans, or calorie tracking.`,
  ].join('\n')
}

function buildWeightLossContext(input: OnboardingAnswers): string | null {
  if (!input.goals.includes('lose-weight')) return null

  return [
    'Weight-loss coaching context:',
    `- Target weight: ${input.targetWeightKg ?? 'not provided'} kg.`,
    `- Preferred pace: ${
      input.weightLossPace
        ? WEIGHT_LOSS_PACE_LABELS[input.weightLossPace]
        : 'not provided'
    }.`,
    '- If pace is aggressive or daily activity is high, reduce junk volume and avoid excessive systemic fatigue.',
    '- Prioritize recoverable strength retention, sustainable conditioning density, and joint-friendly exercise selection.',
    '- Do not create meal plans, macros, or explicit calorie prescriptions.',
  ].join('\n')
}

export function buildWorkoutPlanUserMessage(input: OnboardingAnswers): string {
  return [
    'Create a one-week strength and conditioning microcycle as JSON matching the provided schema.',
    '',
    buildHardRequirements(input),
    '',
    buildAnthropometricsSection(input),
    '',
    buildWeightLossContext(input),
    '',
    buildTrainingStyleRules(input.trainingStyle),
    '',
    'User profile (JSON):',
    JSON.stringify(input, null, 2),
  ].join('\n')
}

export const WORKOUT_PLAN_SYSTEM_PROMPT = buildSystemPrompt()
