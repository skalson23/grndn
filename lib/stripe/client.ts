import Stripe from 'stripe'

import { getStripeSecretKey } from '@/lib/billing/config'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  const secretKey = getStripeSecretKey()
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.')
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }

  return stripeClient
}
