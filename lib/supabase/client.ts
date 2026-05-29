'use client'

import { createBrowserClient } from '@supabase/ssr'

import { getSupabasePublicEnv, isSupabaseConfigured } from './config'

export { isSupabaseConfigured }

/** Browser-only Supabase client (anon key). Never use the service role in the browser. */
export function createClient() {
  const { url, key } = getSupabasePublicEnv()
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  return createBrowserClient(url, key)
}
