import {
  DEFAULT_LOCALE,
  dictionaries,
  type Locale,
  type TranslationKey,
  type TranslationValues,
} from './dictionaries'

function readPath(source: unknown, key: string): string | null {
  const value = key.split('.').reduce<unknown>((current, segment) => {
    if (
      current != null &&
      typeof current === 'object' &&
      segment in current
    ) {
      return (current as Record<string, unknown>)[segment]
    }
    return undefined
  }, source)

  return typeof value === 'string' ? value : null
}

function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template

  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = values[key]
    return value == null ? match : String(value)
  })
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  values?: TranslationValues
): string {
  const dictionary = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
  const fallbackDictionary = dictionaries[DEFAULT_LOCALE]
  const template = readPath(dictionary, key) ?? readPath(fallbackDictionary, key)

  return interpolate(template ?? key, values)
}
