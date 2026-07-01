import { NextResponse } from 'next/server'

import { isPaymentsEnabled } from '@/lib/billing/config'
import { isStripeConfigured } from '@/lib/billing/stripe-config.server'
import {
  CheckoutSyncError,
  syncCheckoutSession,
} from '@/lib/billing/sync-checkout-session'
import {
  getStripeErrorDetails,
  logStripeError,
  stripeErrorStatusCode,
} from '@/lib/billing/stripe-errors'
import { getStripeClient } from '@/lib/stripe/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const runtime = 'nodejs'

function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

function isCheckoutSessionId(value: string): boolean {
  return value.startsWith('cs_')
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get('session_id')?.trim()

  if (!sessionId) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[GRNDN checkout verify] Missing session_id query parameter')
    }
    return jsonError('Missing session_id query parameter after checkout redirect.', 400, {
      code: 'missing_session_id',
    })
  }

  if (!isCheckoutSessionId(sessionId)) {
    return jsonError(
      `Invalid checkout session id format (expected cs_*, received "${sessionId.slice(0, 12)}…").`,
      400,
      { code: 'invalid_session_id' }
    )
  }

  if (!isPaymentsEnabled()) {
    return NextResponse.json({
      ok: true,
      paymentsEnabled: false,
      billingStatus: null,
    })
  }

  if (!isStripeConfigured()) {
    const message =
      'Stripe is not configured. Set STRIPE_SECRET_KEY and both price IDs.'
    console.error('[GRNDN checkout verify]', message)
    return jsonError(message, 503, { code: 'stripe_not_configured' })
  }

  if (!isSupabaseConfigured()) {
    const message = 'Supabase is not configured.'
    console.error('[GRNDN checkout verify]', message)
    return jsonError(message, 503, { code: 'supabase_not_configured' })
  }

  try {
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })

    if (session.status !== 'complete') {
      return jsonError(
        `Checkout session is not complete (status: ${session.status ?? 'unknown'}).`,
        400,
        { code: 'session_not_complete', status: session.status }
      )
    }

    if (
      session.payment_status !== 'paid' &&
      session.payment_status !== 'no_payment_required'
    ) {
      return jsonError(
        `Payment not completed (payment_status: ${session.payment_status ?? 'unknown'}).`,
        402,
        { code: 'payment_not_completed', paymentStatus: session.payment_status }
      )
    }

    const sessionUserId =
      session.client_reference_id ?? session.metadata?.supabase_user_id ?? null

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[GRNDN checkout verify] Supabase getUser failed', userError.message)
      }
      return jsonError(
        `Supabase auth error: ${userError.message}`,
        401,
        { code: 'supabase_auth_error' }
      )
    }

    if (user && sessionUserId && user.id !== sessionUserId) {
      return jsonError(
        'Checkout session does not belong to the current signed-in user.',
        403,
        { code: 'session_user_mismatch' }
      )
    }

    const subscription = await syncCheckoutSession(session)

    if (process.env.NODE_ENV === 'development') {
      console.info('[GRNDN checkout verify] session verified', {
        sessionId,
        userId: subscription.user_id,
        billingStatus: subscription.billing_status,
        stripeMode: sessionId.includes('_test_') ? 'test' : 'live',
      })
    }

    return NextResponse.json({
      ok: true,
      billingStatus: subscription.billing_status,
      subscription,
    })
  } catch (error) {
    if (error instanceof CheckoutSyncError) {
      console.error('[GRNDN checkout verify] sync failed', error.code, error.message)
      return jsonError(error.message, 500, { code: error.code })
    }

    const details = logStripeError('checkout verify', error)
    const status = stripeErrorStatusCode(error, 500)

    return jsonError(details.message, status, {
      code: details.code ?? details.type ?? 'stripe_error',
      ...(process.env.NODE_ENV === 'development'
        ? {
            details: {
              type: details.type,
              code: details.code,
              param: details.param,
              statusCode: details.statusCode,
            },
          }
        : {}),
    })
  }
}
