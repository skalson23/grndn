import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function joinWaitlist(email: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Waitlist is not configured yet.')
  }

  const res = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    let message = 'Could not join the waitlist.'
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
}
