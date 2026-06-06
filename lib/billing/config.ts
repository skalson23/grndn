export function isPaymentsEnabled(): boolean {
  const value = process.env.ENABLE_PAYMENTS?.trim().toLowerCase()
  return value === 'true' || value === '1'
}

export function getStripeSecretKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null
}

export function getStripePublishableKey(): string | null {
  return process.env.STRIPE_PUBLISHABLE_KEY?.trim() || null
}

export function getStripePriceId(): string | null {
  return process.env.STRIPE_PRICE_ID?.trim() || null
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey() && getStripePriceId())
}

export function getAdminApiSecret(): string | null {
  return process.env.BILLING_ADMIN_SECRET?.trim() || null
}
