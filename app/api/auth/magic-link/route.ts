import { NextResponse } from 'next/server'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { storePendingProgramSave } from '@/lib/programs/complete-pending-save'
import { logSaveFlow, logSaveFlowWarn } from '@/lib/programs/save-flow-log'
import {
  getSupabaseAuthEndpoint,
  getSupabasePublicEnv,
  isSupabaseConfigured,
} from '@/lib/supabase/config'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  buildAuthCallbackUrl,
  getAuthRedirectOrigin,
  PRODUCTION_SITE_ORIGIN,
} from '@/lib/supabase/site-origin'
import { workoutPlanSchema } from '@/lib/workout-plan/schema'

type MagicLinkBody = {
  email?: string
  next?: string
  saveCurrentProgram?: boolean
  plan?: unknown
  profile?: unknown
}

export async function POST(request: Request) {
  const logPrefix = '[GRNDN magic-link]'

  if (!isSupabaseConfigured()) {
    console.error(logPrefix, 'Supabase not configured')
    return NextResponse.json(
      { error: 'Supabase is not configured for saving programs.' },
      { status: 503 }
    )
  }

  const { url: supabaseProjectUrl, key: anonKeyPrefix } = getSupabasePublicEnv()
  const authRedirectOrigin = getAuthRedirectOrigin(request)

  console.log(logPrefix, 'env', {
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    normalizedSupabaseUrl: supabaseProjectUrl,
    anonKeyPrefix: anonKeyPrefix ? `${anonKeyPrefix.slice(0, 12)}…` : null,
    nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    authRedirectOrigin,
    productionSiteOrigin: PRODUCTION_SITE_ORIGIN,
    requestUrl: request.url,
    originHeader: request.headers.get('origin'),
    hostHeader: request.headers.get('host'),
  })

  let body: MagicLinkBody
  try {
    body = (await request.json()) as MagicLinkBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim()
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  logSaveFlow('magic_link_requested', {
    emailDomain: email.split('@')[1] ?? 'unknown',
    saveCurrentProgram: Boolean(body.saveCurrentProgram),
    hasPlan: Boolean(body.plan),
  })

  if (body.saveCurrentProgram && body.plan) {
    const checked = workoutPlanSchema.safeParse(body.plan)
    if (checked.success) {
      const profile = (body.profile as OnboardingData | null) ?? null
      const stored = await storePendingProgramSave(email, checked.data, profile)
      if (!stored) {
        logSaveFlowWarn('magic_link_pending_save_not_stored_server_side')
      }
    } else {
      logSaveFlowWarn('magic_link_pending_save_invalid_plan')
    }
  } else if (body.saveCurrentProgram) {
    logSaveFlowWarn('magic_link_save_requested_without_plan_payload')
  }

  const emailRedirectTo = buildAuthCallbackUrl(request, {
    next: body.next,
    saveCurrentProgram: body.saveCurrentProgram,
  })
  const otpEndpoint = getSupabaseAuthEndpoint(supabaseProjectUrl, 'otp')

  console.log(logPrefix, 'urls', {
    authRedirectOrigin,
    emailRedirectTo,
    supabaseOtpEndpoint: otpEndpoint,
  })

  try {
    const supabase = await createServerSupabaseClient()

    console.log(logPrefix, 'calling signInWithOtp', {
      emailDomain: email.split('@')[1] ?? 'unknown',
      shouldCreateUser: true,
      emailRedirectTo,
    })

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: true,
      },
    })

    if (error) {
      console.error(logPrefix, 'signInWithOtp error', {
        message: error.message,
        status: error.status,
        name: error.name,
        supabaseProjectUrl,
        otpEndpoint,
        emailRedirectTo,
      })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log(logPrefix, 'signInWithOtp success', {
      emailDomain: email.split('@')[1] ?? 'unknown',
      emailRedirectTo,
    })
    logSaveFlow('magic_link_sent', {
      emailDomain: email.split('@')[1] ?? 'unknown',
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not send magic link.'
    console.error(logPrefix, 'unexpected exception', {
      message,
      supabaseProjectUrl,
      otpEndpoint,
      emailRedirectTo,
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
