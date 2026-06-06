import { NextResponse } from 'next/server'

import { isValidWaitlistEmail } from '@/lib/waitlist/validate-email'
import { sendWaitlistNotification } from '@/lib/waitlist/send-notification'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  let email: string
  try {
    const body = (await request.json()) as { email?: string }
    email = String(body.email ?? '')
      .trim()
      .toLowerCase()
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  if (!email || !isValidWaitlistEmail(email)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('waitlist').insert({ email })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, status: 'duplicate' })
      }
      console.error('[GRNDN waitlist] Insert failed', error)
      return NextResponse.json({ error: 'failed' }, { status: 500 })
    }

    void sendWaitlistNotification(email)

    return NextResponse.json({ ok: true, status: 'created' })
  } catch (error) {
    console.error('[GRNDN waitlist] Unexpected error', error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
