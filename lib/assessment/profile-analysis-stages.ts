/** Profile-only analysis steps (no OpenAI). */
export const PROFILE_ANALYSIS_STAGE_KEYS = [
  'bodyProfile',
  'experience',
  'recoveryCapacity',
  'fatigueTolerance',
  'weeklyVolume',
] as const

export type ProfileAnalysisStageKey = (typeof PROFILE_ANALYSIS_STAGE_KEYS)[number]

export const PROFILE_ANALYSIS_STAGE_MS = 850
