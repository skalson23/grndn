export type WaitlistStatus = 'created' | 'duplicate'

export async function joinWaitlist(email: string): Promise<WaitlistStatus> {
  const res = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    throw new Error('WAITLIST_FAILED')
  }

  const body = (await res.json()) as { status?: WaitlistStatus }
  return body.status === 'duplicate' ? 'duplicate' : 'created'
}
