import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ user: null })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user?.email) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
