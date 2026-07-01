'use client'

import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env.public'

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

/** Polls briefly after magic-link redirect while session cookies sync. */
export async function waitForAuthenticatedUser(
  options: { attempts?: number; delayMs?: number } = {}
): Promise<User | null> {
  const { attempts = 10, delayMs = 400 } = options

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const user = await getAuthenticatedUser()
    if (user) return user
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  return null
}
