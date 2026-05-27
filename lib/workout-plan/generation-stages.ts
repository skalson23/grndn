export const PLAN_GENERATION_STAGES = [
  'Analyzing training profile…',
  'Optimizing recovery balance…',
  'Calculating fatigue management…',
  'Building progression structure…',
  'Designing your training split…',
  'Finalizing GRNDN protocol…',
] as const

/** Minimum time the cinematic loader runs (ms). */
export const PLAN_GENERATION_MIN_MS = 7200

/** Time per stage before advancing (ms). */
export const PLAN_GENERATION_STAGE_MS = 1200
