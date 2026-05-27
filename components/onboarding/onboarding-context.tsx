'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface OnboardingData {
  goals: string[]
  experience: string
  /** hypertrophy | strength | v_taper | powerbuilding | athletic | minimalist */
  trainingStyle: string
  /** sedentary | lightly_active | moderately_active | very_active | athlete_level */
  activityLevel: string
  equipment: string[]
  injuries: string[]
  /** e.g. male | female | non-binary | prefer-not-to-say */
  sex: string
  /** Age in years */
  age: number
  /** Body mass in kilograms */
  weightKg: number
  /** Height in centimeters */
  heightCm: number
  muscleGroups: string[]
  targetWeightKg: number | null
  /** aggressive | moderate | sustainable */
  weightLossPace: string
  frequency: number
  duration: number
}

export const ONBOARDING_BASE_STEP_COUNT = 15
export const ONBOARDING_WEIGHT_LOSS_EXTRA_STEPS = 2
export const ONBOARDING_STEP_COUNT =
  ONBOARDING_BASE_STEP_COUNT + ONBOARDING_WEIGHT_LOSS_EXTRA_STEPS

export function isWeightLossGoal(data: Pick<OnboardingData, 'goals'>) {
  return data.goals.includes('lose-weight')
}

export function getOnboardingStepCount(data: Pick<OnboardingData, 'goals'>) {
  return (
    ONBOARDING_BASE_STEP_COUNT +
    (isWeightLossGoal(data) ? ONBOARDING_WEIGHT_LOSS_EXTRA_STEPS : 0)
  )
}

export const defaultOnboardingData: OnboardingData = {
  goals: [],
  experience: '',
  trainingStyle: '',
  activityLevel: '',
  equipment: [],
  injuries: [],
  sex: '',
  age: 28,
  weightKg: 75,
  heightCm: 172,
  muscleGroups: [],
  targetWeightKg: null,
  weightLossPace: '',
  frequency: 3,
  duration: 45,
}

export type OnboardingContextValue = {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  resetData: () => void
  currentStep: number
  direction: 1 | -1
  goNext: () => void
  goBack: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData)

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetData = useCallback(() => {
    setData(defaultOnboardingData)
    setDirection(1)
    setCurrentStep(0)
  }, [])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentStep((prev) =>
      Math.min(prev + 1, getOnboardingStepCount(data) - 1)
    )
  }, [data])

  const goBack = useCallback(() => {
    setDirection(-1)
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const value = useMemo(
    () => ({
      data,
      updateData,
      resetData,
      currentStep,
      direction,
      goNext,
      goBack,
    }),
    [data, updateData, resetData, currentStep, direction, goNext, goBack]
  )

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return ctx
}
