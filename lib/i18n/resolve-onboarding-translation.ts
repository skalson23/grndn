import { ONBOARDING_OPTIONS_NAMESPACE } from './onboarding-message-catalog'

export function isMissingOnboardingTranslation(
  relativeKey: string,
  value: string
): boolean {
  const fullKey = `${ONBOARDING_OPTIONS_NAMESPACE}.${relativeKey}`
  return (
    value === fullKey ||
    value === relativeKey ||
    value.startsWith(`${ONBOARDING_OPTIONS_NAMESPACE}.`)
  )
}

export function resolveOnboardingOptionTranslation(
  relativeKey: string,
  value: string
): string {
  if (!isMissingOnboardingTranslation(relativeKey, value)) {
    return value
  }

  const message = `Missing onboarding translation: ${ONBOARDING_OPTIONS_NAMESPACE}.${relativeKey}`

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message)
  }

  console.error(message)
  return '—'
}
