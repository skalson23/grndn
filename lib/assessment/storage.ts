import type { OnboardingData } from '@/components/onboarding/onboarding-context'

export const ASSESSMENT_PROFILE_KEY = 'grndn_assessment_profile_v1'

export function writeAssessmentProfile(profile: OnboardingData): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(ASSESSMENT_PROFILE_KEY, JSON.stringify(profile))
  window.localStorage.setItem(ASSESSMENT_PROFILE_KEY, JSON.stringify(profile))
}

export function readAssessmentProfile(): OnboardingData | null {
  if (typeof window === 'undefined') return null

  for (const storage of ['sessionStorage', 'localStorage'] as const) {
    const raw = window[storage].getItem(ASSESSMENT_PROFILE_KEY)
    if (!raw) continue
    try {
      return JSON.parse(raw) as OnboardingData
    } catch {
      // try next storage
    }
  }

  return null
}

export function clearAssessmentProfile(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(ASSESSMENT_PROFILE_KEY)
  window.localStorage.removeItem(ASSESSMENT_PROFILE_KEY)
}
