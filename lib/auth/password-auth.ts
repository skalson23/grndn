'use client'

import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function signUpWithPassword(
  email: string,
  password: string
): Promise<User> {
  if (!isSupabaseConfigured()) {
    throw new Error('Authentication is not configured.')
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })

  if (error) throw error

  if (!data.user) {
    throw new Error('Could not create account.')
  }

  if (!data.session) {
    throw new Error('confirm_email')
  }

  return data.user
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<User> {
  if (!isSupabaseConfigured()) {
    throw new Error('Authentication is not configured.')
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) throw error
  if (!data.user?.email) {
    throw new Error('Sign in succeeded but no account email was returned.')
  }

  return data.user
}
