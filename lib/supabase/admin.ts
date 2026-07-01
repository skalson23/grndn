import 'server-only'

import { createClient } from '@supabase/supabase-js'

import { getSupabasePublicEnv, isSupabaseConfigured } from './env.public'

/**
 * Server-only admin client (service role). Import only from Route Handlers,
 * Server Actions, or other server-only modules — never from client components.
 */
export function createAdminClient() {
  const { url } = getSupabasePublicEnv()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function isAdminSupabaseConfigured(): boolean {
  return Boolean(isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY)
}
