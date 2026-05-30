const LOG_PREFIX = '[GRNDN workout-gen]'

export function logWorkoutGeneration(
  event: string,
  data?: Record<string, unknown>
): void {
  if (data && Object.keys(data).length > 0) {
    console.log(LOG_PREFIX, event, data)
    return
  }
  console.log(LOG_PREFIX, event)
}
