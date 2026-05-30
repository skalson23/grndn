import type { AppLocale } from '@/i18n/routing'

/** English catalog names → Polish display names for overlap-filter replacements. */
const EXERCISE_NAMES_PL: Record<string, string> = {
  'Cable Fly': 'Rozpiętki na wyciągu',
  'Cable Lateral Raise': 'Unoszenie ramion bokiem na wyciągu',
  'Cable Pushdown': 'Prostowanie ramion na wyciągu (triceps)',
}

const OVERLAP_CUES_EN = {
  shoulderIsolation:
    'Low-fatigue accessory work to keep pressing volume recoverable.',
  genericReplacement:
    'Low-fatigue accessory chosen to avoid redundant heavy pressing overlap.',
  volumeReduced:
    'Volume reduced because this movement overlaps with an earlier heavy press.',
} as const

const OVERLAP_CUES_PL = {
  shoulderIsolation:
    'Akcesoria o niskim obciążeniu, aby utrzymać regenerację po wyciskaniu.',
  genericReplacement:
    'Ćwiczenie akcesoryjne o niskim obciążeniu — unikamy nadmiaru ciężkiego wyciskania.',
  volumeReduced:
    'Objętość zredukowana, bo ruch pokrywa się z wcześniejszym ciężkim wyciskaniem.',
} as const

export function localizeExerciseName(name: string, locale: AppLocale): string {
  if (locale === 'pl') {
    return EXERCISE_NAMES_PL[name] ?? name
  }
  return name
}

export function overlapFilterCoachingCue(
  locale: AppLocale,
  kind: keyof typeof OVERLAP_CUES_EN
): string {
  return locale === 'pl' ? OVERLAP_CUES_PL[kind] : OVERLAP_CUES_EN[kind]
}
