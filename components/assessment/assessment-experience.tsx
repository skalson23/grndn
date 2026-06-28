'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import { ProfileAnalysisLoader } from '@/components/assessment/profile-analysis-loader'
import { TrainingPreviewScreen } from '@/components/assessment/training-preview-screen'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import {
  OnboardingFlowInner,
  OnboardingProvider,
  type OnboardingData,
} from '@/components/onboarding/onboarding-flow'
import { getOnboardingStepCount } from '@/components/onboarding/onboarding-context'
import { readAssessmentProfile, writeAssessmentProfile } from '@/lib/assessment/storage'

type AssessmentPhase = 'questionnaire' | 'analysis' | 'preview'

const POST_QUESTIONNAIRE_STEPS = 2

export function AssessmentExperience() {
  const [phase, setPhase] = useState<AssessmentPhase>('questionnaire')
  const [profile, setProfile] = useState<OnboardingData | null>(null)
  const [totalSteps, setTotalSteps] = useState(17)

  useEffect(() => {
    const saved = readAssessmentProfile()
    if (!saved) return
    setProfile(saved)
    setTotalSteps(getOnboardingStepCount(saved) + POST_QUESTIONNAIRE_STEPS)
    setPhase('preview')
  }, [])

  const handleQuestionnaireComplete = useCallback((data: OnboardingData) => {
    writeAssessmentProfile(data)
    setProfile(data)
    setTotalSteps(getOnboardingStepCount(data) + POST_QUESTIONNAIRE_STEPS)
    setPhase('analysis')
  }, [])

  if (phase === 'questionnaire') {
    return (
      <OnboardingProvider onQuestionnaireComplete={handleQuestionnaireComplete}>
        <OnboardingFlowInner />
      </OnboardingProvider>
    )
  }

  const questionnaireSteps = totalSteps - POST_QUESTIONNAIRE_STEPS

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === 'analysis' && profile && (
          <>
            <div className="fixed inset-x-0 top-0 z-[110] bg-background">
              <ProgressBar
                currentStep={questionnaireSteps + 1}
                totalSteps={totalSteps}
              />
            </div>
            <ProfileAnalysisLoader
              profile={profile}
              onComplete={() => setPhase('preview')}
            />
          </>
        )}

        {phase === 'preview' && profile && (
          <TrainingPreviewScreen
            profile={profile}
            progressStep={totalSteps}
            totalSteps={totalSteps}
          />
        )}
      </AnimatePresence>
    </>
  )
}
