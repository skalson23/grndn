'use client'

import { createBrowserClient } from '@supabase/ssr'

import {
  assertBrowserSafeSupabaseKey,
  getSupabasePublicEnv,
  isSupabaseConfigured,
} from './env.public'

export { isSupabaseConfigured }

/** Browser-only Supabase client (anon/publishable key). Never use the service role in the browser. */
export function createClient() {
  const { url, key } = getSupabasePublicEnv()
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  assertBrowserSafeSupabaseKey(key)

  return createBrowserClient(url, key)
}
