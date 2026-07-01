import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import type { AppLocale } from '@/i18n/routing'

import type { WorkoutPlan } from './schema'
import { logWorkoutGeneration } from './generation-log'

type ErrorBody = { error?: string; details?: unknown }

export async function requestWorkoutPlan(
  answers: OnboardingData,
  locale: AppLocale
): Promise<WorkoutPlan> {
  logWorkoutGeneration('client_request_start', {
    locale,
    frequency: answers.frequency,
  })

  const res = await fetch('/api/workout-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ...answers, locale }),
  })

  let body: ErrorBody & { plan?: WorkoutPlan } = {}
  try {
    body = (await res.json()) as typeof body
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    const msg =
      typeof body.error === 'string'
        ? body.error
        : `Workout plan request failed (${res.status})`
    throw new Error(msg)
  }

  if (!body.plan || typeof body.plan !== 'object') {
    throw new Error('Invalid response: missing plan')
  }

  logWorkoutGeneration('client_request_success', {
    locale,
    planTitle: body.plan.planTitle,
    firstSessionName: body.plan.weeklySessions[0]?.name ?? null,
  })

  return body.plan
}
