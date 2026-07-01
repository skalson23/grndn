'use client'

type VerifyCheckoutResponse = {
  ok?: boolean
  error?: string
  code?: string
  details?: Record<string, unknown>
  billingStatus?: string | null
}

function logCheckoutVerifyError(message: string, details?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[GRNDN checkout verify]', message, details)
  }
}

export async function verifyCheckoutSession(sessionId: string): Promise<void> {
  const res = await fetch(
    `/api/stripe/checkout/verify?session_id=${encodeURIComponent(sessionId)}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )

  let body: VerifyCheckoutResponse = {}
  try {
    body = (await res.json()) as VerifyCheckoutResponse
  } catch {
    body = {}
  }

  if (!res.ok || body.error) {
    const message = body.error ?? `Checkout verification failed (${res.status}).`
    logCheckoutVerifyError(message, { status: res.status, body })
    throw new Error(message)
  }
}
