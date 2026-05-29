import { NextResponse } from 'next/server'

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

type MagicLinkBody = {
  email?: string
  next?: string
  saveCurrentProgram?: boolean
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
