import type { AppLocale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import en from '@/messages/en.json'
import pl from '@/messages/pl.json'

export type PdfMessages = (typeof en)['pdf']

const catalogs: Record<AppLocale, PdfMessages> = {
  en: en.pdf,
  pl: pl.pdf,
}

export function getPdfMessages(locale?: string): PdfMessages {
  if (locale && routing.locales.includes(locale as AppLocale)) {
    return catalogs[locale as AppLocale]
  }
  return catalogs[routing.defaultLocale]
}

export function formatPdfMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value == null ? match : String(value)
  })
}
