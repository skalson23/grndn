import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { NextResponse } from 'next/server'

import {
  buildWorkoutPlanSystemPrompt,
  buildWorkoutPlanUserMessage,
} from '@/lib/workout-plan/build-prompt'
import { applyExerciseOverlapFilter } from '@/lib/workout-plan/exercise-overlap-filter'
import { logWorkoutGeneration } from '@/lib/workout-plan/generation-log'
import {
  onboardingAnswersSchema,
  workoutPlanRequestSchema,
  workoutPlanSchema,
  type WorkoutPlan,
} from '@/lib/workout-plan/schema'

export const runtime = 'nodejs'
export const maxDuration = 60

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details !== undefined ? { details } : {}) },
    { status }
  )
}

function validatePlanMatchesInput(
  plan: WorkoutPlan,
  frequency: number
): string | null {
  if (plan.weeklySessions.length !== frequency) {
    return `Expected weeklySessions.length === ${frequency}, got ${plan.weeklySessions.length}`
  }
  const orders = plan.weeklySessions.map((s) => s.order).sort((a, b) => a - b)
  for (let i = 0; i < frequency; i++) {
    if (orders[i] !== i + 1) {
      return `Session order fields must be 1..${frequency} once each; got ${orders.join(', ')}`
    }
  }
  return null
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return jsonError(
      'Server misconfiguration: OPENAI_API_KEY is not set.',
      503
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body.', 400)
  }

  const parsedInput = workoutPlanRequestSchema.safeParse(body)
  if (!parsedInput.success) {
    return jsonError('Invalid onboarding payload.', 422, parsedInput.error.flatten())
  }

  const { locale, ...input } = parsedInput.data
  const model =
    process.env.OPENAI_WORKOUT_MODEL?.trim() || 'gpt-4o-mini'

  const systemPrompt = buildWorkoutPlanSystemPrompt(locale)
  const userMessage = buildWorkoutPlanUserMessage(input, locale)

  logWorkoutGeneration('api_locale_received', {
    locale,
    frequency: input.frequency,
    model,
  })

  logWorkoutGeneration('api_openai_prompt', {
    locale,
    systemPromptHasPolish: systemPrompt.includes('OUTPUT LANGUAGE: POLISH'),
    userMessageHasLocale: userMessage.includes(`Request locale: ${locale}`),
    userMessageEndsWithReminder: userMessage.includes('FINAL CHECK'),
  })

  const openai = new OpenAI({ apiKey })

  try {
    const completion = await openai.chat.completions.parse({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: zodResponseFormat(workoutPlanSchema, 'workout_plan'),
    })

    const message = completion.choices[0]?.message
    if (message?.refusal) {
      return jsonError('The model refused to generate a plan.', 502, {
        refusal: message.refusal,
      })
    }

    if (!message?.parsed) {
      const finish = completion.choices[0]?.finish_reason
      return jsonError('No structured plan returned from the model.', 502, {
        finish_reason: finish,
      })
    }

    const plan = applyExerciseOverlapFilter(message.parsed, locale)

    logWorkoutGeneration('api_plan_generated', {
      locale,
      planTitle: plan.planTitle,
      firstSessionName: plan.weeklySessions[0]?.name ?? null,
      firstExerciseName: plan.weeklySessions[0]?.exercises[0]?.name ?? null,
    })

    const mismatch = validatePlanMatchesInput(plan, input.frequency)
    if (mismatch) {
      return jsonError('Plan did not match requested frequency.', 422, {
        reason: mismatch,
      })
    }

    return NextResponse.json({ plan })
  } catch (e) {
    const err = e as { message?: string; status?: number }
    const status =
      typeof err.status === 'number' &&
      err.status >= 400 &&
      err.status < 600
        ? err.status
        : 502
    return jsonError(err.message ?? 'OpenAI request failed.', status)
  }
}
