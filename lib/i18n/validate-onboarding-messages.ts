import {
  ONBOARDING_ACTIVITY_IDS,
  ONBOARDING_DURATION_MINUTES,
  ONBOARDING_EQUIPMENT_IDS,
  ONBOARDING_EXPERIENCE_IDS,
  ONBOARDING_FREQUENCY_DAYS,
  ONBOARDING_GOAL_IDS,
  ONBOARDING_INJURY_IDS,
  ONBOARDING_MUSCLE_GROUP_IDS,
  ONBOARDING_OPTIONS_NAMESPACE,
  ONBOARDING_TRAINING_STYLE_IDS,
  ONBOARDING_WEIGHT_LOSS_PACE_IDS,
} from './onboarding-message-catalog'

type MessageTree = Record<string, unknown>

function getNestedValue(root: MessageTree, path: string[]): unknown {
  let current: unknown = root
  for (const segment of path) {
    if (current == null || typeof current !== 'object' || Array.isArray(current)) {
      return undefined
    }
    current = (current as MessageTree)[segment]
  }
  return current
}

function requireString(
  root: MessageTree,
  path: string[],
  locale: string,
  missing: string[]
): void {
  const value = getNestedValue(root, path)
  if (typeof value !== 'string' || value.trim().length === 0) {
    missing.push(`${locale}:${ONBOARDING_OPTIONS_NAMESPACE}.${path.join('.')}`)
  }
}

function requireTitleDescriptionGroup(
  root: MessageTree,
  locale: string,
  missing: string[],
  group: string,
  ids: readonly string[]
): void {
  for (const id of ids) {
    requireString(root, ['onboarding', 'options', group, id, 'title'], locale, missing)
    requireString(
      root,
      ['onboarding', 'options', group, id, 'description'],
      locale,
      missing
    )
  }
}

/** Collect missing dynamic onboarding.option translation keys for a message catalog. */
export function collectMissingOnboardingOptionKeys(
  messages: MessageTree,
  locale: string
): string[] {
  const missing: string[] = []

  for (const day of ONBOARDING_FREQUENCY_DAYS) {
    requireString(
      messages,
      ['onboarding', 'options', 'frequency', String(day), 'label'],
      locale,
      missing
    )
    requireString(
      messages,
      ['onboarding', 'options', 'frequency', String(day), 'description'],
      locale,
      missing
    )
  }

  for (const minutes of ONBOARDING_DURATION_MINUTES) {
    requireString(
      messages,
      ['onboarding', 'options', 'duration', String(minutes), 'label'],
      locale,
      missing
    )
    requireString(
      messages,
      ['onboarding', 'options', 'duration', String(minutes), 'description'],
      locale,
      missing
    )
  }

  requireTitleDescriptionGroup(messages, locale, missing, 'goal', ONBOARDING_GOAL_IDS)
  requireTitleDescriptionGroup(
    messages,
    locale,
    missing,
    'experience',
    ONBOARDING_EXPERIENCE_IDS
  )
  requireTitleDescriptionGroup(
    messages,
    locale,
    missing,
    'activity',
    ONBOARDING_ACTIVITY_IDS
  )
  requireTitleDescriptionGroup(
    messages,
    locale,
    missing,
    'trainingStyle',
    ONBOARDING_TRAINING_STYLE_IDS
  )
  requireTitleDescriptionGroup(
    messages,
    locale,
    missing,
    'weightLossPace',
    ONBOARDING_WEIGHT_LOSS_PACE_IDS
  )
  requireTitleDescriptionGroup(
    messages,
    locale,
    missing,
    'injury',
    ONBOARDING_INJURY_IDS
  )

  for (const id of ONBOARDING_MUSCLE_GROUP_IDS) {
    requireString(
      messages,
      ['onboarding', 'options', 'muscleGroup', id],
      locale,
      missing
    )
  }

  for (const id of ONBOARDING_EQUIPMENT_IDS) {
    requireString(
      messages,
      ['onboarding', 'options', 'equipment', id],
      locale,
      missing
    )
  }

  return missing
}

export function assertOnboardingMessagesComplete(
  messages: MessageTree,
  locale: string
): void {
  const missing = collectMissingOnboardingOptionKeys(messages, locale)
  if (missing.length === 0) return

  throw new Error(
    `Missing onboarding translation keys (${missing.length}):\n${missing.join('\n')}`
  )
}
