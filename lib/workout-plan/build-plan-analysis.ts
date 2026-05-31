import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { estimateTdee } from '@/lib/onboarding/tdee'
import type { TrainingStyleId } from '@/lib/onboarding/training-style'

import type { WorkoutPlan } from './schema'

export type ScorecardMetricId =
  | 'goalAlignment'
  | 'recoveryBalance'
  | 'timeEfficiency'
  | 'volumeQuality'

export type ScorecardMetric = {
  id: ScorecardMetricId
  score: number
}

export type WhyBulletId =
  | 'muscleEmphasis'
  | 'upperVolume'
  | 'lowerVolume'
  | 'goalFocus'
  | 'trainingStyleFocus'
  | 'sustainableRecovery'
  | 'progressiveOverload'
  | 'timeEfficiency'
  | 'injuryAware'

export type WhyBullet = {
  id: WhyBulletId
  values?: Record<string, string | number>
}

export type InsightId =
  | 'chestVolume'
  | 'upperFrequency'
  | 'lowerBalance'
  | 'strengthFoundation'
  | 'vTaperFocus'
  | 'fatLossRecovery'
  | 'athleticConditioning'
  | 'minimalistEfficiency'
  | 'balancedSplit'
  | 'fullBodyRhythm'

export type PlanAnalysisInsight = {
  id: InsightId
  values?: Record<string, string | number>
}

export type PlanAnalysisSnapshot = {
  protocolName: string
  useGeneratedTitle: boolean
  whyBullets: WhyBullet[]
  scorecard: ScorecardMetric[]
  insight: PlanAnalysisInsight
}

export type AnalysisInsightSignal =
  | { id: 'muscleEmphasis'; muscle: string }
  | { id: 'experienceProfile'; level: string }
  | { id: 'trainingDays'; count: number }
  | { id: 'recoveryProfile' }
  | { id: 'maintenanceCalories'; count: number }
  | { id: 'trainingStyle'; style: string }
  | { id: 'sessionDuration'; minutes: number }

const GENERIC_TITLE_PATTERNS = [
  /^workout plan$/i,
  /^training plan$/i,
  /^plan treningowy$/i,
  /^weekly plan$/i,
  /^tygodniowy plan$/i,
]

function clampScore(value: number): number {
  return Math.min(98, Math.max(88, Math.round(value)))
}

function hashSeed(values: number[]): number {
  return values.reduce((acc, value) => acc + value * 17, 0) % 7
}

function primaryMuscle(
  muscleGroups: string[]
): string | null {
  if (muscleGroups.length === 0 || muscleGroups.includes('full-body')) {
    return null
  }
  return muscleGroups[0] ?? null
}

function resolveProtocolNameKey(
  profile: OnboardingData,
  plan: WorkoutPlan
): { key: string; values?: Record<string, string> } | null {
  const muscle = primaryMuscle(profile.muscleGroups)
  const style = profile.trainingStyle as TrainingStyleId

  if (muscle === 'chest') return { key: 'protocolNames.chestPriority' }
  if (muscle === 'back' || muscle === 'shoulders' || muscle === 'arms') {
    return { key: 'protocolNames.upperDominance' }
  }
  if (muscle === 'legs' || muscle === 'glutes') {
    return { key: 'protocolNames.lowerFoundation' }
  }

  if (style === 'strength') return { key: 'protocolNames.strengthFoundation' }
  if (style === 'v_taper') return { key: 'protocolNames.vTaperSystem' }
  if (style === 'athletic') return { key: 'protocolNames.performanceBlock' }
  if (style === 'minimalist') return { key: 'protocolNames.efficiencyBlock' }
  if (profile.goals.includes('lose-weight')) {
    return { key: 'protocolNames.recompositionPlan' }
  }

  if (plan.planTitle && !GENERIC_TITLE_PATTERNS.some((p) => p.test(plan.planTitle.trim()))) {
    return null
  }

  return { key: 'protocolNames.adaptiveProtocol' }
}

export function resolveProtocolDisplayName(
  profile: OnboardingData,
  plan: WorkoutPlan
): { name: string | null; fallbackKey: string; fallbackValues?: Record<string, string> } {
  const generic = GENERIC_TITLE_PATTERNS.some((p) =>
    p.test(plan.planTitle.trim())
  )

  if (!generic && plan.planTitle.trim()) {
    return { name: plan.planTitle.trim(), fallbackKey: '' }
  }

  const named = resolveProtocolNameKey(profile, plan)
  return {
    name: null,
    fallbackKey: named?.key ?? 'protocolNames.adaptiveProtocol',
    fallbackValues: named?.values,
  }
}

function buildScorecard(profile: OnboardingData, plan: WorkoutPlan): ScorecardMetric[] {
  const seed = hashSeed([
    profile.frequency,
    profile.duration,
    profile.experience.length,
    profile.goals.length,
    plan.weeklySessions.length,
  ])

  const goalScore = clampScore(
    91 +
      (profile.goals.length > 0 ? 4 : 0) +
      (profile.muscleGroups.length > 0 && !profile.muscleGroups.includes('full-body')
        ? 3
        : 1) -
      seed * 0.3
  )

  const recoveryScore = clampScore(
    90 +
      (profile.frequency <= 4 ? 5 : profile.frequency <= 5 ? 2 : -2) +
      (profile.experience === 'beginner' ? 2 : 0) -
      seed * 0.2
  )

  const timeScore = clampScore(
    92 +
      (profile.duration <= 60 ? 4 : 1) +
      (profile.frequency <= 5 ? 2 : 0) -
      seed * 0.25
  )

  const volumeScore = clampScore(
    90 +
      (profile.trainingStyle === 'hypertrophy' || profile.trainingStyle === 'powerbuilding'
        ? 4
        : 2) +
      (plan.weeklySessions.length === profile.frequency ? 3 : 0) -
      seed * 0.15
  )

  return [
    { id: 'goalAlignment', score: goalScore },
    { id: 'recoveryBalance', score: recoveryScore },
    { id: 'timeEfficiency', score: timeScore },
    { id: 'volumeQuality', score: volumeScore },
  ]
}

function buildWhyBullets(profile: OnboardingData): WhyBullet[] {
  const bullets: WhyBullet[] = []
  const muscle = primaryMuscle(profile.muscleGroups)

  if (muscle) {
    bullets.push({ id: 'muscleEmphasis', values: { muscle } })
  } else if (
    profile.muscleGroups.includes('shoulders') ||
    profile.muscleGroups.includes('arms') ||
    profile.muscleGroups.includes('chest')
  ) {
    bullets.push({ id: 'upperVolume' })
  } else if (
    profile.muscleGroups.includes('legs') ||
    profile.muscleGroups.includes('glutes')
  ) {
    bullets.push({ id: 'lowerVolume' })
  }

  if (profile.goals.length > 0) {
    bullets.push({ id: 'goalFocus', values: { goal: profile.goals[0] } })
  }

  if (profile.trainingStyle) {
    bullets.push({
      id: 'trainingStyleFocus',
      values: { style: profile.trainingStyle },
    })
  }

  bullets.push({ id: 'sustainableRecovery' })
  bullets.push({ id: 'progressiveOverload' })

  if (profile.duration <= 60 && profile.frequency <= 5) {
    bullets.push({ id: 'timeEfficiency' })
  }

  if (
    profile.injuries.length > 0 &&
    !(profile.injuries.length === 1 && profile.injuries[0] === 'none')
  ) {
    bullets.push({ id: 'injuryAware' })
  }

  return bullets.slice(0, 5)
}

function sessionText(plan: WorkoutPlan): string {
  return plan.weeklySessions
    .flatMap((s) => [s.name, s.primaryFocus, ...s.exercises.map((e) => e.name)])
    .join(' ')
    .toLowerCase()
}

function buildInsight(profile: OnboardingData, plan: WorkoutPlan): PlanAnalysisInsight {
  const corpus = sessionText(plan)
  const muscle = primaryMuscle(profile.muscleGroups)
  const style = profile.trainingStyle as TrainingStyleId

  if (muscle === 'chest' || /chest|klat/i.test(corpus)) {
    return { id: 'chestVolume' }
  }

  if (
    muscle === 'back' ||
    muscle === 'shoulders' ||
    muscle === 'arms' ||
    /upper|pull|push|ramion|plec/i.test(corpus)
  ) {
    return {
      id: 'upperFrequency',
      values: { days: profile.frequency },
    }
  }

  if (muscle === 'legs' || muscle === 'glutes' || /leg|squat|hinge|nóg|biod/i.test(corpus)) {
    return { id: 'lowerBalance' }
  }

  if (style === 'strength') return { id: 'strengthFoundation' }
  if (style === 'v_taper') return { id: 'vTaperFocus' }
  if (profile.goals.includes('lose-weight')) return { id: 'fatLossRecovery' }
  if (style === 'athletic') return { id: 'athleticConditioning' }
  if (style === 'minimalist') return { id: 'minimalistEfficiency' }

  if (profile.muscleGroups.includes('full-body') || profile.muscleGroups.length === 0) {
    return { id: 'fullBodyRhythm', values: { days: profile.frequency } }
  }

  return { id: 'balancedSplit', values: { days: plan.weeklySessions.length } }
}

export function buildPlanAnalysis(
  profile: OnboardingData | null,
  plan: WorkoutPlan
): PlanAnalysisSnapshot | null {
  if (!profile) return null

  const protocol = resolveProtocolDisplayName(profile, plan)

  return {
    protocolName: protocol.name ?? '',
    useGeneratedTitle: Boolean(protocol.name),
    whyBullets: buildWhyBullets(profile),
    scorecard: buildScorecard(profile, plan),
    insight: buildInsight(profile, plan),
  }
}

export function buildAnalysisInsightSignals(
  profile: OnboardingData
): AnalysisInsightSignal[] {
  const signals: AnalysisInsightSignal[] = []
  const muscle = primaryMuscle(profile.muscleGroups)

  if (muscle) {
    signals.push({ id: 'muscleEmphasis', muscle })
  }

  if (profile.experience) {
    signals.push({ id: 'experienceProfile', level: profile.experience })
  }

  signals.push({ id: 'trainingDays', count: profile.frequency })

  if (profile.activityLevel) {
    signals.push({ id: 'recoveryProfile' })
  }

  const tdee = profile.activityLevel ? estimateTdee(profile) : null
  if (tdee) {
    signals.push({ id: 'maintenanceCalories', count: tdee.maintenanceCalories })
  }

  if (profile.trainingStyle) {
    signals.push({ id: 'trainingStyle', style: profile.trainingStyle })
  }

  signals.push({ id: 'sessionDuration', minutes: profile.duration })

  return signals
}
