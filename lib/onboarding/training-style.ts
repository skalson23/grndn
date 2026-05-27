import { z } from 'zod'

export const TRAINING_STYLE_IDS = [
  'hypertrophy',
  'strength',
  'v_taper',
  'powerbuilding',
  'athletic',
  'minimalist',
] as const

export type TrainingStyleId = (typeof TRAINING_STYLE_IDS)[number]

export const trainingStyleSchema = z.enum(TRAINING_STYLE_IDS)

export const TRAINING_STYLE_OPTIONS: {
  id: TrainingStyleId
  title: string
  description: string
}[] = [
  {
    id: 'hypertrophy',
    title: 'Hypertrophy',
    description:
      'Balanced muscle growth and bodybuilding-focused training.',
  },
  {
    id: 'strength',
    title: 'Strength',
    description:
      'Heavier compounds, lower reps and performance-focused progression.',
  },
  {
    id: 'v_taper',
    title: 'Aesthetic / V-Taper',
    description:
      'Prioritize wide lats, capped delts and upper-body aesthetics.',
  },
  {
    id: 'powerbuilding',
    title: 'Powerbuilding',
    description:
      'Blend strength progression with bodybuilding hypertrophy work.',
  },
  {
    id: 'athletic',
    title: 'Athletic',
    description:
      'Explosive, athletic and conditioning-oriented training.',
  },
  {
    id: 'minimalist',
    title: 'Minimalist',
    description:
      'Lower volume, high-efficiency training with minimal junk volume.',
  },
]

export const TRAINING_STYLE_LABELS: Record<TrainingStyleId, string> = {
  hypertrophy: 'Hypertrophy',
  strength: 'Strength',
  v_taper: 'Aesthetic / V-Taper',
  powerbuilding: 'Powerbuilding',
  athletic: 'Athletic',
  minimalist: 'Minimalist',
}
