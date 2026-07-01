/** Client-safe billing flags (no Stripe secrets). */
export function isPaymentsEnabled(): boolean {
  const value = process.env.ENABLE_PAYMENTS?.trim().toLowerCase()
  return value === 'true' || value === '1'
}
