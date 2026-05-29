const PREFIX = '[GRNDN save-flow]'

export function logSaveFlow(
  step: string,
  details?: Record<string, unknown>
): void {
  if (details) {
    console.info(PREFIX, step, details)
    return
  }
  console.info(PREFIX, step)
}

export function logSaveFlowWarn(
  step: string,
  details?: Record<string, unknown>
): void {
  if (details) {
    console.warn(PREFIX, step, details)
    return
  }
  console.warn(PREFIX, step)
}

export function logSaveFlowError(
  step: string,
  details?: Record<string, unknown>
): void {
  if (details) {
    console.error(PREFIX, step, details)
    return
  }
  console.error(PREFIX, step)
}
