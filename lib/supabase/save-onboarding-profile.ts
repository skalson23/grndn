import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { persistOnboardingProfile } from '@/lib/onboarding/persist'

import { createClient, isSupabaseConfigured } from './client'
import { tryResolveSupabaseUser } from './ensure-session'

/** Optionally sync onboarding answers to Supabase. Failures are logged and never thrown. */
export async function saveOnboardingProfileOptional(
  data: OnboardingData
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }

  try {
    const client = createClient()
    const user = await tryResolveSupabaseUser(client)
    if (!user) {
      return
    }

    await persistOnboardingProfile(client, user.id, data)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn('[GRNDN] Could not save profile to Supabase:', message)
  }
}
