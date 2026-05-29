export const PLAN_GENERATION_STAGE_KEYS = [
  'analyzing',
  'recovery',
  'fatigue',
  'progression',
  'split',
  'finalizing',
] as const

export type PlanGenerationStageKey = (typeof PLAN_GENERATION_STAGE_KEYS)[number]

/** Minimum time the cinematic loader runs (ms). */
export const PLAN_GENERATION_MIN_MS = 7200

/** Time per stage before advancing (ms). */
export const PLAN_GENERATION_STAGE_MS = 1200
