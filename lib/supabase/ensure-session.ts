import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Best-effort session resolution. Never throws — returns null when auth is unavailable
 * or when the user has not completed the lightweight magic-link flow.
 */
export async function tryResolveSupabaseUser(
  client: SupabaseClient
): Promise<User | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await client.auth.getSession()

    if (sessionError) {
      console.warn('[GRNDN] Supabase getSession failed:', sessionError.message)
      return null
    }

    if (session?.user) {
      return session.user
    }

    return null
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn('[GRNDN] Supabase auth unavailable:', message)
    return null
  }
}
