import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

type MagicLinkBody = {
  email?: string
  next?: string
  saveCurrentProgram?: boolean
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured for saving programs.' },
      { status: 503 }
    )
  }

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

  const origin =
    request.headers.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    new URL(request.url).origin

  const callbackUrl = new URL('/auth/callback', origin)
  callbackUrl.searchParams.set('next', body.next ?? '/results')
  if (body.saveCurrentProgram) {
    callbackUrl.searchParams.set('save', '1')
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        shouldCreateUser: true,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not send magic link.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
