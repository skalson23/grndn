import { NextResponse } from 'next/server'

import {
  getSupabaseAuthEndpoint,
  getSupabasePublicEnv,
  isSupabaseConfigured,
} from '@/lib/supabase/config'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  console.log(logPrefix, 'env', {
    rawSupabaseUrl,
    normalizedSupabaseUrl: supabaseProjectUrl,
    anonKeyPrefix: anonKeyPrefix ? `${anonKeyPrefix.slice(0, 12)}…` : null,
    nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
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

  const requestOrigin = new URL(request.url).origin
  const origin =
    request.headers.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    requestOrigin

  console.log(logPrefix, 'redirect origin resolution', {
    originHeader: request.headers.get('origin'),
    nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    requestOrigin,
    chosenOrigin: origin,
  })

  const callbackUrl = new URL('/auth/callback', origin)
  callbackUrl.searchParams.set('next', body.next ?? '/results')
  if (body.saveCurrentProgram) {
    callbackUrl.searchParams.set('save', '1')
  }

  const emailRedirectTo = callbackUrl.toString()
  const otpEndpoint = getSupabaseAuthEndpoint(supabaseProjectUrl, 'otp')

  console.log(logPrefix, 'urls', {
    callbackPath: callbackUrl.pathname,
    callbackSearch: callbackUrl.search,
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

    console.log(logPrefix, 'signInWithOtp success', { emailDomain: email.split('@')[1] ?? 'unknown' })
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
