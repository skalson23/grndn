/**
 * Optional Resend notification when WAITLIST_NOTIFICATION_EMAIL and RESEND_API_KEY are set.
 * Failures are logged only — signup still succeeds.
 */
export async function sendWaitlistNotification(email: string): Promise<void> {
  const to = process.env.WAITLIST_NOTIFICATION_EMAIL?.trim()
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!to || !apiKey) return

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ??
    'GRNDN Waitlist <onboarding@resend.dev>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'New GRNDN waitlist signup',
        text: `A new user joined the waitlist:\n\n${email}`,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[GRNDN waitlist] Resend notification failed', {
        status: res.status,
        body,
      })
    }
  } catch (error) {
    console.error('[GRNDN waitlist] Resend notification error', error)
  }
}
