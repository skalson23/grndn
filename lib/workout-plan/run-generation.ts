import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import type { AppLocale } from '@/i18n/routing'
import { saveOnboardingProfileOptional } from '@/lib/supabase/save-onboarding-profile'

import {
  ANALYSIS_REVEAL_SESSION_KEY,
  PLAN_GENERATION_STAGE_KEYS,
  PLAN_GENERATION_STAGE_MS,
} from './generation-stages'
import { requestWorkoutPlan } from './request-plan'
import type { WorkoutPlan } from './schema'
import { WORKOUT_PLAN_STORAGE_KEY } from './storage'
import { logWorkoutGeneration } from './generation-log'

export type GenerationProgress = {
  stageIndex: number
  stageKey: (typeof PLAN_GENERATION_STAGE_KEYS)[number]
  progress: number
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assertNotFailed(apiError: Error | null): void {
  if (apiError) {
    throw apiError
  }
}

/**
 * Calls /api/workout-plan immediately, runs the analysis step animation in
 * parallel while waiting, fails fast on API error, and only resolves once the
 * plan is stored and the full step sequence has finished.
 */
export async function runWorkoutPlanGeneration(
  data: OnboardingData,
  locale: AppLocale,
  onProgress: (progress: GenerationProgress) => void,
  onApiSuccess?: () => void
): Promise<WorkoutPlan> {
  let apiError: Error | null = null
  let plan: WorkoutPlan | null = null

  logWorkoutGeneration('generation_start', { locale, frequency: data.frequency })

  const apiPromise = (async () => {
    try {
      plan = await requestWorkoutPlan(data, locale)
      logWorkoutGeneration('generation_api_success', {
        locale,
        planTitle: plan.planTitle,
      })
      onApiSuccess?.()
      void saveOnboardingProfileOptional(data)
    } catch (e) {
      apiError = e instanceof Error ? e : new Error(String(e))
      logWorkoutGeneration('generation_api_failed', {
        message: apiError.message,
      })
    }
  })()

  for (let i = 0; i < PLAN_GENERATION_STAGE_KEYS.length; i++) {
    assertNotFailed(apiError)

    onProgress({
      stageIndex: i,
      stageKey: PLAN_GENERATION_STAGE_KEYS[i],
      progress: (i + 1) / PLAN_GENERATION_STAGE_KEYS.length,
    })

    const isFinalStep = i === PLAN_GENERATION_STAGE_KEYS.length - 1

    if (isFinalStep) {
      // Last step: wait for both the animation beat and a successful API response.
      await Promise.all([delay(PLAN_GENERATION_STAGE_MS), apiPromise])
    } else {
      // Fail as soon as the API rejects — do not wait for remaining steps.
      await Promise.race([
        delay(PLAN_GENERATION_STAGE_MS),
        apiPromise.then(() => assertNotFailed(apiError)),
      ])
    }

    assertNotFailed(apiError)
  }

  if (!plan) {
    throw new Error('No workout plan was returned.')
  }

  try {
    sessionStorage.setItem(
      WORKOUT_PLAN_STORAGE_KEY,
      JSON.stringify({ plan, profile: data, locale })
    )
    sessionStorage.setItem(ANALYSIS_REVEAL_SESSION_KEY, '1')
    logWorkoutGeneration('generation_stored', {
      locale,
      planTitle: plan.planTitle,
    })
  } catch {
    throw new Error('Could not store your plan in the browser.')
  }

  onProgress({
    stageIndex: PLAN_GENERATION_STAGE_KEYS.length - 1,
    stageKey: PLAN_GENERATION_STAGE_KEYS[PLAN_GENERATION_STAGE_KEYS.length - 1],
    progress: 1,
  })

  return plan
}
