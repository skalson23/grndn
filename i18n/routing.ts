import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'pl'],
  defaultLocale: 'en',
  localePrefix: 'always',
})

export type AppLocale = (typeof routing.locales)[number]

/** Locale-prefixed app path, e.g. localePath('pl', '/results') → '/pl/results' */
export function localePath(locale: string, pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (normalized === '/') {
    return `/${locale}`
  }
  return `/${locale}${normalized}`
}

export const defaultLocaleResultsPath = localePath(
  routing.defaultLocale,
  '/results'
)
