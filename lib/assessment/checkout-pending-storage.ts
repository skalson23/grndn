import type { StripeBillingPlan } from '@/lib/billing/stripe-plans'

export const CHECKOUT_PENDING_KEY = 'grndn_checkout_pending_v1'

export type PendingCheckout = {
  plan: StripeBillingPlan
  locale: string
  createdAt: number
}

export function writePendingCheckout(pending: Omit<PendingCheckout, 'createdAt'>): void {
  if (typeof window === 'undefined') return
  const payload: PendingCheckout = { ...pending, createdAt: Date.now() }
  const raw = JSON.stringify(payload)
  window.sessionStorage.setItem(CHECKOUT_PENDING_KEY, raw)
  window.localStorage.setItem(CHECKOUT_PENDING_KEY, raw)
}

export function readPendingCheckout(): PendingCheckout | null {
  if (typeof window === 'undefined') return null

  for (const storage of ['sessionStorage', 'localStorage'] as const) {
    const raw = window[storage].getItem(CHECKOUT_PENDING_KEY)
    if (!raw) continue
    try {
      return JSON.parse(raw) as PendingCheckout
    } catch {
      // try next storage
    }
  }

  return null
}

export function clearPendingCheckout(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(CHECKOUT_PENDING_KEY)
  window.localStorage.removeItem(CHECKOUT_PENDING_KEY)
}
