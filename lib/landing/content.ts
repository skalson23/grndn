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

export type LandingFeature = {
  icon: LucideIcon
  title: string
  line: string
}

export const MOBILE_FEATURES: LandingFeature[] = [
  {
    icon: Brain,
    title: 'AI protocols',
    line: 'Programs built around your body—not random workouts.',
  },
  {
    icon: Activity,
    title: 'Fatigue-aware',
    line: 'Smart volume so you recover and still progress.',
  },
  {
    icon: Target,
    title: 'Your style',
    line: 'Hypertrophy, strength, or V-taper. You choose.',
  },
  {
    icon: ShieldCheck,
    title: 'Recovery logic',
    line: 'Training that respects sleep, stress, and limits.',
  },
  {
    icon: FileText,
    title: 'Premium PDFs',
    line: 'Export programs that look pro in the gym.',
  },
]

export const SOCIAL_STATS = [
  { label: 'On a streak', value: '12.8k', icon: Flame },
  { label: 'Sessions today', value: '24.1k', icon: Zap },
  { label: 'PRs this week', value: '9.2k', icon: Trophy },
] as const

export const LIVE_ACTIVITY = [
  { user: 'm.kova', action: 'hit a 5-day streak', time: '2m' },
  { user: 'j.lee', action: 'finished Push A', time: '4m' },
  { user: 'a.rossi', action: 'unlocked new protocol', time: '7m' },
] as const

export const DESKTOP_FEATURES = [
  {
    icon: Brain,
    title: 'AI Workout Generation',
    description: 'Structured protocols built around your body, goal and schedule.',
  },
  {
    icon: Activity,
    title: 'Fatigue-Aware Programming',
    description: 'Software guardrails reduce redundant high-fatigue overlap.',
  },
  {
    icon: Target,
    title: 'V-Taper & Strength Styles',
    description: 'Choose the training philosophy that matches your outcome.',
  },
  {
    icon: ShieldCheck,
    title: 'Smart Recovery Logic',
    description: 'Activity, limitations and pace inform recoverable training.',
  },
  {
    icon: FileText,
    title: 'Premium PDF Programs',
    description: 'Export clean, polished training programs built for real use.',
  },
]
