import { NextResponse } from 'next/server'

import { getAdminApiSecret } from '@/lib/billing/config'
import { grantBetaAccess } from '@/lib/billing/subscriptions'
import { isAdminSupabaseConfigured } from '@/lib/supabase/admin'

type GrantBetaBody = {
  userId?: string
  email?: string
}

/**
 * Admin-only: mark a user as beta-grandfathered (retains access when payments enabled).
 * Requires header: Authorization: Bearer <BILLING_ADMIN_SECRET>
 */
export async function POST(request: Request) {
  const adminSecret = getAdminApiSecret()
  if (!adminSecret) {
    return NextResponse.json(
      { error: 'BILLING_ADMIN_SECRET is not configured.' },
      { status: 503 }
    )
  }

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()
  if (token !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAdminSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase admin not configured.' }, { status: 503 })
  }

  let body: GrantBetaBody
  try {
    body = (await request.json()) as GrantBetaBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const userId = body.userId?.trim()
  const email = body.email?.trim()

  if (!userId || !email) {
    return NextResponse.json(
      { error: 'userId and email are required.' },
      { status: 400 }
    )
  }

  const subscription = await grantBetaAccess(userId, email)
  if (!subscription) {
    return NextResponse.json({ error: 'Could not grant beta access.' }, { status: 500 })
  }

  return NextResponse.json({ subscription })
}
