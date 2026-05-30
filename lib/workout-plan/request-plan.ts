import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import type { AppLocale } from '@/i18n/routing'

import type { WorkoutPlan } from './schema'

type ErrorBody = { error?: string; details?: unknown }

export async function requestWorkoutPlan(
  answers: OnboardingData,
  locale: AppLocale
): Promise<WorkoutPlan> {
  const res = await fetch('/api/workout-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  return body.plan
}
