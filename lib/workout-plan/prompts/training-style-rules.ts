import type { TrainingStyleId } from '@/lib/onboarding/training-style'
import { TRAINING_STYLE_LABELS } from '@/lib/onboarding/training-style'

const STYLE_DIRECTIVES: Record<TrainingStyleId, string> = {
  hypertrophy: [
    '- Prioritize moderate rep ranges, controlled tempo, and clear muscle intent.',
    '- Use balanced bodybuilding volume with stable, hypertrophy-efficient movements.',
    '- Add isolation strategically without padding sessions with junk volume.',
  ].join('\n'),
  strength: [
    '- Prioritize heavy compounds early in the session.',
    '- Bias primary lifts toward lower rep ranges and longer rest times.',
    '- Use a lower exercise count and accessories that support weak links.',
  ].join('\n'),
  v_taper: [
    '- Prioritize lateral delts, lats, upper back, rear delts, width and silhouette.',
    '- Reduce unnecessary chest and lower-body fatigue that does not serve the aesthetic goal.',
    '- Keep maintenance lower-body and arm work for balance.',
  ].join('\n'),
  powerbuilding: [
    '- Pair heavy compounds with hypertrophy accessories.',
    '- Lead with strength intent, then build muscle around the primary movement pattern.',
    '- Balance load progression with recoverable bodybuilding volume.',
  ].join('\n'),
  athletic: [
    '- Include athletic movement patterns, unilateral work, carries, and conditioning where appropriate.',
    '- Use explosive intent safely when experience and injuries allow.',
    '- Preserve movement quality and recovery; do not chase fatigue for its own sake.',
  ].join('\n'),
  minimalist: [
    '- Use fewer exercises with the highest stimulus-to-fatigue ratio.',
    '- Avoid redundant isolation and overlapping movement patterns.',
    '- Maximize efficiency while still covering weekly movement balance.',
  ].join('\n'),
}

export function buildTrainingStyleRules(trainingStyle: TrainingStyleId): string {
  return [
    `TRAINING STYLE: ${TRAINING_STYLE_LABELS[trainingStyle]}`,
    'Apply these rules in addition to goals, muscle emphasis, experience, equipment and safety constraints.',
    STYLE_DIRECTIVES[trainingStyle],
  ].join('\n')
}
