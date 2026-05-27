import type { SupabaseClient } from '@supabase/supabase-js'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'

/** Maps wizard state → `public.onboarding_profiles` columns. */
export function toOnboardingRow(data: OnboardingData) {
  return {
    goals: data.goals,
    experience: data.experience,
    training_style: data.trainingStyle,
    activity_level: data.activityLevel,
    equipment: data.equipment,
    injuries: data.injuries,
    sex: data.sex,
    age: data.age,
    weight_kg: data.weightKg,
    height_cm: data.heightCm,
    muscle_groups: data.muscleGroups,
    target_weight_kg: data.targetWeightKg,
    weight_loss_pace: data.weightLossPace,
    frequency: data.frequency,
    duration: data.duration,
  }
}

/** Upserts onboarding answers for the given user id. Caller must supply an authenticated Supabase session. */
export async function persistOnboardingProfile(
  client: SupabaseClient,
  userId: string,
  data: OnboardingData
) {
  const row = {
    user_id: userId,
    ...toOnboardingRow(data),
    completed_at: new Date().toISOString(),
  }

  const { error } = await client.from('onboarding_profiles').upsert(row, {
    onConflict: 'user_id',
  })

  if (error) {
    throw error
  }
}
