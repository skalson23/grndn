import { CORE_RULES } from './core-rules'
import { EXERCISE_SELECTION_RULES } from './exercise-selection-rules'
import { RECOVERY_RULES } from './recovery-rules'
import { SPECIALIZATION_RULES } from './specialization-rules'

export function buildSystemPrompt(): string {
  return [
    CORE_RULES,
    EXERCISE_SELECTION_RULES,
    RECOVERY_RULES,
    SPECIALIZATION_RULES,
  ].join('\n\n--------------------------------------------------\n\n')
}
