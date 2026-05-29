import {
  Activity,
  Brain,
  FileText,
  Flame,
  ShieldCheck,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const MOBILE_FEATURE_KEYS = [
  { icon: Brain, key: 'aiProtocols' },
  { icon: Activity, key: 'fatigueAware' },
  { icon: Target, key: 'yourStyle' },
  { icon: ShieldCheck, key: 'recoveryLogic' },
  { icon: FileText, key: 'premiumPdfs' },
] as const satisfies ReadonlyArray<{ icon: LucideIcon; key: string }>

export const SOCIAL_STATS = [
  { labelKey: 'onStreak', value: '12.8k', icon: Flame },
  { labelKey: 'sessionsToday', value: '24.1k', icon: Zap },
  { labelKey: 'prsWeek', value: '9.2k', icon: Trophy },
] as const

export const LIVE_ACTIVITY = [
  { user: 'm.kova', actionKey: 'hitStreak', time: '2m' },
  { user: 'j.lee', actionKey: 'finishedPushA', time: '4m' },
  { user: 'a.rossi', actionKey: 'unlockedProtocol', time: '7m' },
] as const

export const DESKTOP_FEATURE_KEYS = [
  { icon: Brain, key: 'aiGeneration' },
  { icon: Activity, key: 'fatigueProgramming' },
  { icon: Target, key: 'vTaperStrength' },
  { icon: ShieldCheck, key: 'recoveryLogic' },
  { icon: FileText, key: 'premiumPdf' },
] as const satisfies ReadonlyArray<{ icon: LucideIcon; key: string }>

export const DESKTOP_TAG_KEYS = [
  'tagRecovery',
  'tagHypertrophy',
  'tagPremium',
] as const
