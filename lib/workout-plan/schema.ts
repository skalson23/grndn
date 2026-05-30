import { z } from 'zod'

import { routing } from '@/i18n/routing'
import { ACTIVITY_LEVEL_IDS } from '@/lib/onboarding/activity-level'
import { trainingStyleSchema } from '@/lib/onboarding/training-style'
import { WEIGHT_LOSS_PACE_IDS } from '@/lib/onboarding/weight-loss'

/**
 * OpenAI structured outputs (strict JSON schema) do not support Zod `.optional()`
 * omitting keys — use `.nullable()` or required fields instead.
 */

export const onboardingSexSchema = z.enum([
  'male',
  'female',
  'non-binary',
  'prefer-not-to-say',
])

export const activityLevelSchema = z.enum(ACTIVITY_LEVEL_IDS)
export const weightLossPaceSchema = z.enum(WEIGHT_LOSS_PACE_IDS)

/** Request body: same shape as onboarding wizard answers. */
export const onboardingAnswersSchema = z
  .object({
    goals: z.array(z.string()).max(20),
    experience: z.string().max(64),
    trainingStyle: trainingStyleSchema,
    activityLevel: activityLevelSchema,
    equipment: z.array(z.string()).max(32),
    injuries: z.array(z.string()).max(32),
    sex: onboardingSexSchema,
    age: z.number().int().min(13).max(100),
    weightKg: z.number().min(30).max(300),
    heightCm: z.number().min(120).max(230),
    muscleGroups: z.array(z.string()).max(32),
    targetWeightKg: z.number().min(30).max(300).nullable(),
    weightLossPace: z.union([weightLossPaceSchema, z.literal('')]),
    frequency: z.number().int().min(1).max(7),
    duration: z.number().int().min(10).max(180),
  })
  .superRefine((value, ctx) => {
    if (!value.goals.includes('lose-weight')) return

    if (value.targetWeightKg == null || value.targetWeightKg >= value.weightKg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['targetWeightKg'],
        message: 'Weight loss users must provide a target below current weight.',
      })
    }

    if (value.weightLossPace === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weightLossPace'],
        message: 'Weight loss users must select a preferred pace.',
      })
    }
  })

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>

export const workoutPlanRequestSchema = onboardingAnswersSchema.and(
  z.object({
    locale: z.enum(routing.locales).default(routing.defaultLocale),
  })
)

export type WorkoutPlanRequest = z.infer<typeof workoutPlanRequestSchema>

const exerciseSchema = z.object({
  name: z.string().min(1).max(120),
  sets: z.number().int().min(1).max(12),
  repsOrDuration: z.string().max(64),
  restSeconds: z.number().int().min(0).max(600).nullable(),
  coachingCue: z.string().max(200).nullable(),
})

const sessionSchema = z.object({
  order: z.number().int().min(1).max(7),
  name: z.string().min(1).max(120),
  primaryFocus: z.string().max(120),
  estimatedMinutes: z.number().int().min(10).max(180),
  warmup: z.array(z.string().max(200)).max(12).nullable(),
  exercises: z.array(exerciseSchema).min(2).max(20),
  cooldown: z.array(z.string().max(200)).max(12).nullable(),
})

/** Structured plan returned by OpenAI and validated before sending to the client. */
export const workoutPlanSchema = z.object({
  planTitle: z.string().min(1).max(160),
  planSummary: z.string().min(1).max(800),
  weeklySessions: z.array(sessionSchema).min(1).max(7),
  progressionInstructions: z.string().max(1000),
  safetyNotes: z.string().max(1000).nullable(),
})

export type WorkoutPlan = z.infer<typeof workoutPlanSchema>
