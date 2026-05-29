import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { BRAND_PDF_AUTHOR } from '@/lib/brand'
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

export function parseSavedProgram(row: unknown): SavedProgram {
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
