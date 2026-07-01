'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
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
import { getAuthenticatedUser } from '@/lib/auth/authenticated-user'
import { redirectToStripeCheckout } from '@/lib/billing/redirect-to-stripe-checkout'
import type { StripeBillingPlan } from '@/lib/billing/stripe-plans'

type AssessmentPhase = 'questionnaire' | 'analysis' | 'preview'

const POST_QUESTIONNAIRE_STEPS = 2

function parseResumeCheckoutPlan(value: string | null): StripeBillingPlan | null {
  if (value === 'monthly' || value === 'quarterly') return value
  return null
}

export function AssessmentExperience() {
  const locale = useLocale()
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

  const resumeCheckoutAfterAuth = useCallback(async () => {
    const params = new URLSearchParams(window.location.search)
    const resumePlan = parseResumeCheckoutPlan(params.get('resumeCheckout'))
    if (!resumePlan) return

    const user = await getAuthenticatedUser()
    if (!user) return

    const pending = readPendingCheckout()
    const plan = pending?.plan ?? resumePlan
    const checkoutLocale = pending?.locale ?? locale

    const url = new URL(window.location.href)
    url.searchParams.delete('resumeCheckout')
    window.history.replaceState({}, '', `${url.pathname}${url.search}`)

    try {
      await redirectToStripeCheckout(plan, checkoutLocale)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start checkout.')
    }
  }, [locale])

  useEffect(() => {
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
