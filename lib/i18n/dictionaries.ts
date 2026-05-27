import en from './locales/en.json'
import es from './locales/es.json'
import pl from './locales/pl.json'

export const SUPPORTED_LOCALES = ['en', 'pl', 'es'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const dictionaries = {
  en,
  pl,
  es,
} as const

type Primitive = string | number | boolean | null

type DotPath<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? DotPath<T[K], `${Prefix}${K}.`>
      : `${Prefix}${K}`
}[keyof T & string]

export type TranslationKey = DotPath<typeof en>
export type TranslationValues = Record<string, string | number>

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}
