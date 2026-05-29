import { NextResponse } from 'next/server'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import {
  buildPdfMetadata,
  parseSavedProgram,
} from '@/lib/programs/saved-program-models'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { workoutPlanSchema } from '@/lib/workout-plan/schema'

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured for saved programs.' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('saved_programs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const programs = (data ?? []).map(parseSavedProgram)
    return NextResponse.json({ programs })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Could not load saved programs.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured for saved programs.' },
      { status: 503 }
    )
  }

  let body: { plan?: unknown; profile?: unknown }
  try {
    body = (await request.json()) as { plan?: unknown; profile?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const checked = workoutPlanSchema.safeParse(body.plan)
  if (!checked.success) {
    return NextResponse.json({ error: 'Invalid workout plan.' }, { status: 400 })
  }

  const plan = checked.data
  const profile = (body.profile as OnboardingData | null) ?? null

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: 'Sign in with your email to save this program.' },
        { status: 401 }
      )
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

    const { data, error } = await supabase
      .from('saved_programs')
      .insert(row)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ program: parseSavedProgram(data) })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Could not save this program.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
