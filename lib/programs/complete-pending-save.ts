import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { buildPdfMetadata } from '@/lib/programs/saved-program-models'
import { logSaveFlow, logSaveFlowError, logSaveFlowWarn } from '@/lib/programs/save-flow-log'
import { createAdminClient, isAdminSupabaseConfigured } from '@/lib/supabase/admin'
import { workoutPlanSchema, type WorkoutPlan } from '@/lib/workout-plan/schema'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function storePendingProgramSave(
  email: string,
  plan: WorkoutPlan,
  profile: OnboardingData | null
): Promise<boolean> {
  if (!isAdminSupabaseConfigured()) {
    logSaveFlowWarn('pending_save_skipped_no_service_role', {
      emailDomain: email.split('@')[1] ?? 'unknown',
    })
    return false
  }

  const admin = createAdminClient()
  const normalizedEmail = normalizeEmail(email)

  const { error } = await admin.from('pending_program_saves').upsert(
    {
      email: normalizedEmail,
      plan,
      profile,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    { onConflict: 'email' }
  )

  if (error) {
    logSaveFlowError('pending_save_insert_failed', {
      message: error.message,
      emailDomain: normalizedEmail.split('@')[1] ?? 'unknown',
    })
    return false
  }

  logSaveFlow('pending_save_stored', {
    emailDomain: normalizedEmail.split('@')[1] ?? 'unknown',
    sessionCount: plan.weeklySessions.length,
  })
  return true
}

export async function completePendingProgramSave(
  email: string,
  userId: string
): Promise<{ saved: boolean; reason: string }> {
  if (!isAdminSupabaseConfigured()) {
    logSaveFlowWarn('pending_save_complete_skipped_no_service_role')
    return { saved: false, reason: 'service_role_not_configured' }
  }

  const admin = createAdminClient()
  const normalizedEmail = normalizeEmail(email)

  const { data: pending, error: pendingError } = await admin
    .from('pending_program_saves')
    .select('plan, profile')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (pendingError) {
    logSaveFlowError('pending_save_lookup_failed', { message: pendingError.message })
    return { saved: false, reason: 'pending_lookup_failed' }
  }

  if (!pending) {
    logSaveFlowWarn('pending_save_not_found', {
      emailDomain: normalizedEmail.split('@')[1] ?? 'unknown',
    })
    return { saved: false, reason: 'pending_not_found' }
  }

  const checked = workoutPlanSchema.safeParse(pending.plan)
  if (!checked.success) {
    logSaveFlowError('pending_save_invalid_plan')
    return { saved: false, reason: 'pending_plan_invalid' }
  }

  const plan = checked.data
  const profile = (pending.profile as OnboardingData | null) ?? null
  const pdfMetadata = buildPdfMetadata(plan)

  const { error: insertError } = await admin.from('saved_programs').insert({
    user_id: userId,
    title: plan.planTitle,
    summary: plan.planSummary,
    session_count: plan.weeklySessions.length,
    training_style: profile?.trainingStyle ?? '',
    emphasis: profile?.muscleGroups ?? [],
    generated_plan_json: plan,
    plan,
    profile,
    pdf_metadata: pdfMetadata,
  })

  if (insertError) {
    logSaveFlowError('pending_save_promote_failed', { message: insertError.message })
    return { saved: false, reason: 'saved_program_insert_failed' }
  }

  await admin.from('pending_program_saves').delete().eq('email', normalizedEmail)

  logSaveFlow('pending_save_promoted', {
    userId,
    emailDomain: normalizedEmail.split('@')[1] ?? 'unknown',
    sessionCount: plan.weeklySessions.length,
  })

  return { saved: true, reason: 'promoted_to_saved_programs' }
}
