import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readMessages(locale) {
  return JSON.parse(
    readFileSync(join(root, 'messages', `${locale}.json`), 'utf8')
  )
}

function deepMerge(base, override) {
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
      result[key] = deepMerge(baseValue, overrideValue)
      continue
    }
    if (overrideValue !== undefined) {
      result[key] = overrideValue
    }
  }
  return result
}

const FREQUENCY_DAYS = [1, 2, 3, 4, 5, 6, 7]
const DURATION_MINUTES = [15, 30, 45, 60, 75, 90]
const NS = 'onboarding.options'

function getNested(root, path) {
  let current = root
  for (const segment of path) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[segment]
  }
  return current
}

function collectMissing(messages, locale) {
  const missing = []

  for (const day of FREQUENCY_DAYS) {
    for (const field of ['label', 'description']) {
      const path = ['onboarding', 'options', 'frequency', String(day), field]
      const value = getNested(messages, path)
      if (typeof value !== 'string' || value.trim().length === 0) {
        missing.push(`${locale}:${NS}.frequency.${day}.${field}`)
      }
    }
  }

  for (const minutes of DURATION_MINUTES) {
    for (const field of ['label', 'description']) {
      const path = ['onboarding', 'options', 'duration', String(minutes), field]
      const value = getNested(messages, path)
      if (typeof value !== 'string' || value.trim().length === 0) {
        missing.push(`${locale}:${NS}.duration.${minutes}.${field}`)
      }
    }
  }

  return missing
}

const en = readMessages('en')
const pl = readMessages('pl')
const plMerged = deepMerge(en, pl)

const missing = [
  ...collectMissing(en, 'en'),
  ...collectMissing(plMerged, 'pl'),
]

if (missing.length > 0) {
  console.error('Missing onboarding translation keys:')
  for (const key of missing) {
    console.error(`  - ${key}`)
  }
  process.exit(1)
}

console.log('Onboarding i18n validation passed (en + pl).')
