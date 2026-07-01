'use client'

import type { User } from '@supabase/supabase-js'

import { getAuthenticatedUser } from '@/lib/auth/authenticated-user'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export class CheckoutAuthRequiredError extends Error {
  constructor() {
    super('Authentication required before checkout.')
    this.name = 'CheckoutAuthRequiredError'
  }
}

/** Requires a real Supabase account (email). Never creates anonymous sessions. */
export async function ensureCheckoutAuth(): Promise<User> {
  if (!isSupabaseConfigured()) {
    throw new Error('Billing is not configured.')
  }

  const user = await getAuthenticatedUser()
  if (!user) {
    throw new CheckoutAuthRequiredError()
  }

  return user
}
