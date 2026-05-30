import type { AppLocale } from '@/i18n/routing'
import en from '@/messages/en.json'
import pl from '@/messages/pl.json'

const catalogs = { en, pl } as const

export function getLanguageRules(locale: AppLocale): string {
  if (locale === 'pl') {
    return [
      'LANGUAGE (critical):',
      '- Write every user-facing plan field in Polish: planTitle, planSummary, progressionInstructions, safetyNotes.',
      '- Write weeklySessions[].name, primaryFocus, warmup[], cooldown[], exercises[].name, exercises[].coachingCue, and exercises[].repsOrDuration in Polish.',
      '- Use natural Polish fitness terminology understood in commercial gyms.',
      '- Keep the brand name GRNDN in English.',
    ].join('\n')
  }

  return [
    'LANGUAGE (critical):',
    '- Write every user-facing plan field in English: planTitle, planSummary, progressionInstructions, safetyNotes.',
    '- Write weeklySessions[].name, primaryFocus, warmup[], cooldown[], exercises[].name, exercises[].coachingCue, and exercises[].repsOrDuration in English.',
    '- Keep the brand name GRNDN in English.',
  ].join('\n')
}

export function getPromptCatalog(locale: AppLocale) {
  return catalogs[locale] ?? catalogs.en
}
