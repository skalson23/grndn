import {
  ArrowLeftRight,
  Brain,
  Dumbbell,
  LineChart,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const SOCIAL_PROOF_KEYS = [
  'aiPowered',
  'personalized',
  'progressiveOverload',
  'fastSetup',
] as const

export const HOW_IT_WORKS_STEPS = [
  { step: 1, icon: UserRound, key: 'profile' },
  { step: 2, icon: Sparkles, key: 'generate' },
  { step: 3, icon: TrendingUp, key: 'track' },
] as const

export const FEATURE_KEYS = [
  { icon: Brain, key: 'aiGeneration' },
  { icon: TrendingUp, key: 'progressiveOverload' },
  { icon: ArrowLeftRight, key: 'exerciseSwaps' },
  { icon: LineChart, key: 'smartTracking' },
  { icon: Target, key: 'multipleGoals' },
  { icon: Smartphone, key: 'mobileFriendly' },
] as const

export const FAQ_KEYS = ['whatIsGrndn', 'howGenerated', 'changeExercises', 'beginnerFriendly', 'needGym'] as const

export const FREE_TIER_FEATURES = [
  'onboarding',
  'singlePlan',
  'basicTracking',
] as const

export const PRO_TIER_FEATURES = [
  'aiProtocols',
  'personalizedPlans',
  'pdfExport',
  'savedPrograms',
  'progression',
] as const

export type SocialProofKey = (typeof SOCIAL_PROOF_KEYS)[number]
export type FeatureKey = (typeof FEATURE_KEYS)[number]['key']
export type FaqKey = (typeof FAQ_KEYS)[number]

export function getFeatureIcon(key: string): LucideIcon {
  const found = FEATURE_KEYS.find((item) => item.key === key)
  return found?.icon ?? Dumbbell
}
