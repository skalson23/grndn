import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'

import { routing } from './routing'
import { assertOnboardingMessagesComplete } from '@/lib/i18n/validate-onboarding-messages'

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>
): T {
  const result = { ...base }

  for (const key of Object.keys(override)) {
    const baseValue = base[key]
    const overrideValue = override[key]

    if (
      baseValue != null &&
      overrideValue != null &&
      typeof baseValue === 'object' &&
      typeof overrideValue === 'object' &&
      !Array.isArray(baseValue) &&
      !Array.isArray(overrideValue)
    ) {
      result[key as keyof T] = deepMerge(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>
      ) as T[keyof T]
      continue
    }

    if (overrideValue !== undefined) {
      result[key as keyof T] = overrideValue as T[keyof T]
    }
  }

  return result
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const defaultMessages = (
    await import(`../messages/${routing.defaultLocale}.json`)
  ).default

  const localeMessages =
    locale === routing.defaultLocale
      ? defaultMessages
      : deepMerge(
          defaultMessages,
          (await import(`../messages/${locale}.json`)).default
        )

  assertOnboardingMessagesComplete(localeMessages, locale)

  return {
    locale,
    messages: localeMessages,
  }
})
