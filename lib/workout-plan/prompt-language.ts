import type { AppLocale } from '@/i18n/routing'
import en from '@/messages/en.json'
import pl from '@/messages/pl.json'

const catalogs = { en, pl } as const

const POLISH_EXAMPLES = [
  'Example session name: "Siła górnej partii" (NOT "Upper Body Strength").',
  'Example primaryFocus: "Klatka piersiowa, plecy, ramiona" (NOT "Chest, Back, Arms").',
  'Example warmup: "Dynamiczne krążenia ramion" (NOT "Dynamic Arm Circles").',
  'Example exercise: "Wyciskanie sztangi leżąc" (NOT "Barbell Bench Press").',
  'Example coachingCue: "Łopatki ściągnięte, kontrolowany ruch w dół" (NOT English cues).',
  'Example repsOrDuration: "8–10 powt." or "45 s" (NOT "8-10 reps").',
].join('\n')

export function getLanguageRules(locale: AppLocale): string {
  if (locale === 'pl') {
    return [
      '=== OUTPUT LANGUAGE: POLISH (pl) — MANDATORY ===',
      'The response JSON must be entirely in Polish except the brand name GRNDN.',
      'Do NOT use English for any user-facing string. English output is a critical failure.',
      '',
      'Polish fields (every string value):',
      '- planTitle, planSummary, progressionInstructions, safetyNotes',
      '- weeklySessions[].name, primaryFocus',
      '- weeklySessions[].warmup[] and cooldown[] (every line)',
      '- weeklySessions[].exercises[].name, coachingCue, repsOrDuration',
      '',
      'Use natural Polish gym terminology (commercial fitness context in Poland).',
      'Keep GRNDN in English. Do not translate the brand.',
      '',
      'Polish examples (follow this style):',
      POLISH_EXAMPLES,
    ].join('\n')
  }

  return [
    '=== OUTPUT LANGUAGE: ENGLISH (en) — MANDATORY ===',
    'The response JSON must be entirely in English except the brand name GRNDN.',
    '',
    'English fields (every string value):',
    '- planTitle, planSummary, progressionInstructions, safetyNotes',
    '- weeklySessions[].name, primaryFocus',
    '- weeklySessions[].warmup[] and cooldown[] (every line)',
    '- weeklySessions[].exercises[].name, coachingCue, repsOrDuration',
    '',
    'Keep GRNDN in English.',
  ].join('\n')
}

export function getLocaleReminder(locale: AppLocale): string {
  if (locale === 'pl') {
    return [
      'FINAL CHECK before responding:',
      '- locale = pl',
      '- Every string in the JSON must be Polish.',
      '- Zero English exercise names, session titles, or coaching cues.',
      '- GRNDN stays in English.',
    ].join('\n')
  }

  return [
    'FINAL CHECK before responding:',
    '- locale = en',
    '- Every string in the JSON must be English.',
  ].join('\n')
}

export function getPromptCatalog(locale: AppLocale) {
  return catalogs[locale] ?? catalogs.en
}
