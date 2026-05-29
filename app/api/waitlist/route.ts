import { NextResponse } from 'next/server'

import { createAdminClient, isAdminSupabaseConfigured } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  if (!isAdminSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Waitlist is not configured yet.' },
      { status: 503 }
    )
  }

  let email: string
  try {
    const body = (await request.json()) as { email?: string }
    email = String(body.email ?? '')
      .trim()
      .toLowerCase()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('waitlist_signups').insert({
    email,
    source: 'closed_beta_landing',
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
