'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { ProfileAnalysisLoader } from '@/components/assessment/profile-analysis-loader'
import { TrainingPreviewScreen } from '@/components/assessment/training-preview-screen'
import { ProgressBar } from '@/components/onboarding/progress-bar'
import {
  OnboardingFlowInner,
  OnboardingProvider,
  type OnboardingData,
} from '@/components/onboarding/onboarding-flow'
import { getOnboardingStepCount } from '@/components/onboarding/onboarding-context'
import { readPendingCheckout } from '@/lib/assessment/checkout-pending-storage'
import { readAssessmentProfile, writeAssessmentProfile } from '@/lib/assessment/storage'
import { clearAuthReturnPath } from '@/lib/auth/auth-return-path'
import { waitForAuthenticatedUser } from '@/lib/auth/authenticated-user'
import { redirectToStripeCheckout } from '@/lib/billing/redirect-to-stripe-checkout'

type AssessmentPhase = 'questionnaire' | 'analysis' | 'preview'

const POST_QUESTIONNAIRE_STEPS = 2

export function AssessmentExperience() {
  const [phase, setPhase] = useState<AssessmentPhase>('questionnaire')
  const [profile, setProfile] = useState<OnboardingData | null>(null)
  const [totalSteps, setTotalSteps] = useState(17)
  const resumeAttemptedRef = useRef(false)

  useEffect(() => {
    const saved = readAssessmentProfile()
    if (!saved) return
    setProfile(saved)
    setTotalSteps(getOnboardingStepCount(saved) + POST_QUESTIONNAIRE_STEPS)
    setPhase('preview')
  }, [])

  const resumeCheckoutAfterAuth = useCallback(async () => {
    const pending = readPendingCheckout()
    if (!pending) return

    const user = await waitForAuthenticatedUser()
    if (!user) {
      resumeAttemptedRef.current = false
      return
    }

    try {
      clearAuthReturnPath()
      await redirectToStripeCheckout(pending.plan, pending.locale)
    } catch (error) {
      resumeAttemptedRef.current = false
      toast.error(error instanceof Error ? error.message : 'Could not start checkout.')
    }
  }, [])

  useEffect(() => {
    if (resumeAttemptedRef.current) return
    if (!readPendingCheckout()) return

    resumeAttemptedRef.current = true
    void resumeCheckoutAfterAuth()
  }, [resumeCheckoutAfterAuth])

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
          <ProfileAnalysisLoader
            profile={profile}
            progressBar={
              <ProgressBar
                currentStep={questionnaireSteps + 1}
                totalSteps={totalSteps}
              />
            }
            onComplete={() => setPhase('preview')}
          />
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
