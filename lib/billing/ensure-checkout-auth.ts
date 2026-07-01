'use client'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

/**
 * Ensures a Supabase session exists before Stripe Checkout.
 * Creates an anonymous session when the user has not signed in yet.
 */
export async function ensureCheckoutAuth(): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Billing is not configured.')
  }

  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[GRNDN checkout auth] Supabase getUser failed', userError.message)
    }
    throw new Error(`Supabase auth error: ${userError.message}`)
  }

  if (user) return

  const { error: signInError } = await supabase.auth.signInAnonymously()
  if (signInError) {
    throw new Error(
      'Could not start checkout. Enable Anonymous sign-ins in Supabase, then try again.'
    )
  }
}
