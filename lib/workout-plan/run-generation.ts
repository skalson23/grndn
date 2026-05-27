import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { saveOnboardingProfileOptional } from '@/lib/supabase/save-onboarding-profile'

import {
  PLAN_GENERATION_MIN_MS,
  PLAN_GENERATION_STAGE_MS,
  PLAN_GENERATION_STAGES,
} from './generation-stages'
import { requestWorkoutPlan } from './request-plan'
import type { WorkoutPlan } from './schema'
import { WORKOUT_PLAN_STORAGE_KEY } from './storage'

export type GenerationProgress = {
  stageIndex: number
  stageLabel: string
  progress: number
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Runs plan API in parallel with staged cinematic progress (minimum ~7.2s).
 * Supabase profile sync is optional and never blocks success.
 */
export async function runWorkoutPlanGeneration(
  data: OnboardingData,
  onProgress: (progress: GenerationProgress) => void
): Promise<WorkoutPlan> {
  const startedAt = Date.now()
  let apiError: Error | null = null
  let plan: WorkoutPlan | null = null

  const apiPromise = (async () => {
    try {
      plan = await requestWorkoutPlan(data)
      void saveOnboardingProfileOptional(data)
    } catch (e) {
      apiError = e instanceof Error ? e : new Error(String(e))
    }
  })()

  const stagesPromise = (async () => {
    for (let i = 0; i < PLAN_GENERATION_STAGES.length; i++) {
      onProgress({
        stageIndex: i,
        stageLabel: PLAN_GENERATION_STAGES[i],
        progress: (i + 1) / PLAN_GENERATION_STAGES.length,
      })
      await delay(PLAN_GENERATION_STAGE_MS)
    }
  })()

  await Promise.all([apiPromise, stagesPromise])

  const elapsed = Date.now() - startedAt
  if (elapsed < PLAN_GENERATION_MIN_MS) {
    await delay(PLAN_GENERATION_MIN_MS - elapsed)
  }

  if (apiError) {
    throw apiError
  }
  if (!plan) {
    throw new Error('No workout plan was returned.')
  }

  try {
    sessionStorage.setItem(
      WORKOUT_PLAN_STORAGE_KEY,
      JSON.stringify({ plan, profile: data })
    )
  } catch {
    throw new Error('Could not store your plan in the browser.')
  }

  onProgress({
    stageIndex: PLAN_GENERATION_STAGES.length - 1,
    stageLabel: PLAN_GENERATION_STAGES[PLAN_GENERATION_STAGES.length - 1],
    progress: 1,
  })

  return plan
}
