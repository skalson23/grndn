/** Client + middleware cookie set when closed-beta access code is validated. */
export const BETA_ACCESS_COOKIE = 'grndn_closed_beta_access'

/** Matches localStorage key in app/[locale]/page.tsx */
export const BETA_ACCESS_STORAGE_KEY = 'grndn_closed_beta_access'

/** Cookie max-age: 1 year (seconds) */
export const BETA_ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Paths protected when ENABLE_PAYMENTS=true (without locale prefix). */
export const PREMIUM_ROUTE_SEGMENTS = ['results', 'my-programs'] as const
