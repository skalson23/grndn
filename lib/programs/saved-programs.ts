import type { User } from '@supabase/supabase-js'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { BRAND_PDF_AUTHOR } from '@/lib/brand'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { workoutPlanSchema, type WorkoutPlan } from '@/lib/workout-plan/schema'

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'workout-plan'
  )
}

export type PdfMetadata = {
  fileName: string
  author: string
  generatedAt: string
  pageCount: number
  sessionCount: number
}

export type SavedProgram = {
  id: string
  user_id: string
  title: string
  summary: string
  session_count: number
  training_style: string
  emphasis: string[]
  generated_plan_json: WorkoutPlan
  plan: WorkoutPlan
  profile: OnboardingData | null
  pdf_metadata: PdfMetadata
  created_at: string
  updated_at: string
}

export type SaveProgramInput = {
  plan: WorkoutPlan
  profile?: OnboardingData | null
}

export function buildPdfMetadata(plan: WorkoutPlan): PdfMetadata {
  const sessionCount = plan.weeklySessions.length

  return {
    fileName: `grndn-${slugify(plan.planTitle)}.pdf`,
    author: BRAND_PDF_AUTHOR,
    generatedAt: new Date().toISOString(),
    pageCount: sessionCount + 1,
    sessionCount,
  }
}

export async function getCurrentMagicLinkUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null

  const client = createClient()
  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  if (error || !user?.email) {
    return null
  }

  return user
}

export async function sendMagicLink(
  email: string,
  options: { next?: string; saveCurrentProgram?: boolean } = {}
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured for saving programs.')
  }

  let redirectTo: string | undefined
  if (typeof window !== 'undefined') {
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', options.next ?? '/results')
    if (options.saveCurrentProgram) {
      callbackUrl.searchParams.set('save', '1')
    }
    redirectTo = callbackUrl.toString()
  }

  const client = createClient()
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  })

  if (error) {
    throw error
  }
}

export async function saveProgramToAccount({
  plan,
  profile = null,
}: SaveProgramInput): Promise<SavedProgram> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured for saving programs.')
  }

  const client = createClient()
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser()

  if (userError || !user?.email) {
    throw new Error('Sign in with your email to save this program.')
  }

  const pdfMetadata = buildPdfMetadata(plan)
  const row = {
    user_id: user.id,
    title: plan.planTitle,
    summary: plan.planSummary,
    session_count: plan.weeklySessions.length,
    training_style: profile?.trainingStyle ?? '',
    emphasis: profile?.muscleGroups ?? [],
    generated_plan_json: plan,
    plan,
    profile,
    pdf_metadata: pdfMetadata,
  }

  const { data, error } = await client
    .from('saved_programs')
    .insert(row)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return parseSavedProgram(data)
}

export async function listSavedPrograms(): Promise<SavedProgram[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured for saved programs.')
  }

  const client = createClient()
  const { data, error } = await client
    .from('saved_programs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(parseSavedProgram)
}

function parseSavedProgram(row: unknown): SavedProgram {
  const record = row as Record<string, unknown>
  const checked = workoutPlanSchema.safeParse(record.plan)

  if (!checked.success) {
    throw new Error('Saved program data is invalid.')
  }

  return {
    id: String(record.id),
    user_id: String(record.user_id),
    title: String(record.title),
    summary: String(record.summary),
    session_count: Number(record.session_count),
    training_style: String(record.training_style ?? ''),
    emphasis: Array.isArray(record.emphasis)
      ? record.emphasis.map(String)
      : [],
    generated_plan_json: checked.data,
    plan: checked.data,
    profile: (record.profile as OnboardingData | null) ?? null,
    pdf_metadata: record.pdf_metadata as PdfMetadata,
    created_at: String(record.created_at),
    updated_at: String(record.updated_at),
  }
}
