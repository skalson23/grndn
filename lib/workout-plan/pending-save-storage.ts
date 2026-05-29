import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import type { WorkoutPlan } from '@/lib/workout-plan/schema'
import { WORKOUT_PLAN_STORAGE_KEY } from '@/lib/workout-plan/storage'

/** Survives magic-link redirects in the same browser (unlike sessionStorage in new tabs). */
export const PENDING_PROGRAM_SAVE_KEY = 'grndn_pending_program_save_v1'

export type PendingProgramPayload = {
  plan: WorkoutPlan
  profile: OnboardingData | null
}

export function readSessionPlanPayload(): PendingProgramPayload | null {
  return readPayloadFromStorage('sessionStorage', WORKOUT_PLAN_STORAGE_KEY)
}

export function readLocalPendingPlanPayload(): PendingProgramPayload | null {
  return readPayloadFromStorage('localStorage', PENDING_PROGRAM_SAVE_KEY)
}

function readPayloadFromStorage(
  storage: 'sessionStorage' | 'localStorage',
  key: string
): PendingProgramPayload | null {
  if (typeof window === 'undefined') return null

  const raw = window[storage].getItem(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as {
      plan?: WorkoutPlan
      profile?: OnboardingData | null
    }
    if (!parsed.plan) return null
    return {
      plan: parsed.plan,
      profile: parsed.profile ?? null,
    }
  } catch {
    return null
  }
}

export function writePendingProgramSave(
  plan: WorkoutPlan,
  profile: OnboardingData | null | undefined
): void {
  if (typeof window === 'undefined') return

  const payload = JSON.stringify({
    plan,
    profile: profile ?? null,
    savedAt: new Date().toISOString(),
  })

  window.localStorage.setItem(PENDING_PROGRAM_SAVE_KEY, payload)
  window.sessionStorage.setItem(WORKOUT_PLAN_STORAGE_KEY, payload)
}

export function clearPendingProgramSave(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(PENDING_PROGRAM_SAVE_KEY)
}

export function hydrateSessionFromPayload(payload: PendingProgramPayload): void {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(
    WORKOUT_PLAN_STORAGE_KEY,
    JSON.stringify({ plan: payload.plan, profile: payload.profile })
  )
}
