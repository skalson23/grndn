'use client'

import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

/** Returns a signed-in user with a verified email — never anonymous. */
export async function getAuthenticatedUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user?.email) return null
  if (user.is_anonymous) return null

  return user
}
