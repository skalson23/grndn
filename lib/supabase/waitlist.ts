import { createClient, isSupabaseConfigured } from './client'

export async function joinWaitlist(email: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Waitlist is not configured yet.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const client = createClient()
  const { error } = await client
    .from('waitlist_signups')
    .insert({
      email: normalizedEmail,
      source: 'closed_beta_landing',
    })

  if (error) {
    if (error.code === '23505') return
    throw error
  }
}
