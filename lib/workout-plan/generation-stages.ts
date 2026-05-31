/** Sequential AI analysis steps shown during plan generation. */
export const PLAN_GENERATION_STAGE_KEYS = [
  'bodyProfile',
  'experience',
  'recoveryCapacity',
  'fatigueTolerance',
  'weeklyVolume',
  'exerciseSelection',
  'progressionStructure',
  'finalizingProtocol',
] as const

export type PlanGenerationStageKey = (typeof PLAN_GENERATION_STAGE_KEYS)[number]

/** Time per analysis step (ms). 8 × 950 ≈ 7.6s total sequence. */
export const PLAN_GENERATION_STAGE_MS = 950

/** Session flag: results page should play the analysis reveal sequence. */
export const ANALYSIS_REVEAL_SESSION_KEY = 'grndn_analysis_reveal_v1'
