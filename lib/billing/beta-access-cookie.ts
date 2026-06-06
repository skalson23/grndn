import { BETA_ACCESS_COOKIE, BETA_ACCESS_COOKIE_MAX_AGE } from '@/lib/billing/constants'

/** Persist closed-beta access for middleware when ENABLE_PAYMENTS=true. */
export function persistBetaAccessCookie(): void {
  if (typeof document === 'undefined') return

  document.cookie = `${BETA_ACCESS_COOKIE}=true; path=/; max-age=${BETA_ACCESS_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function clearBetaAccessCookie(): void {
  if (typeof document === 'undefined') return

  document.cookie = `${BETA_ACCESS_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}
