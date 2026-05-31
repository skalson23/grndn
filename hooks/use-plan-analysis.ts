'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import { useOnboardingLabels } from '@/hooks/use-onboarding-labels'
import {
  buildPlanAnalysis,
  resolveProtocolDisplayName,
  type PlanAnalysisSnapshot,
  type WhyBulletId,
} from '@/lib/workout-plan/build-plan-analysis'
import type { WorkoutPlan } from '@/lib/workout-plan/schema'

function translateWhyBullet(
  t: ReturnType<typeof useTranslations<'analysis'>>,
  labels: ReturnType<typeof useOnboardingLabels>,
  bullet: PlanAnalysisSnapshot['whyBullets'][number]
): string {
  const values = bullet.values ?? {}

  switch (bullet.id) {
    case 'muscleEmphasis':
      return t('whyBullets.muscleEmphasis', {
        muscle: labels.muscleGroupLabel(String(values.muscle)),
      })
    case 'upperVolume':
      return t('whyBullets.upperVolume')
    case 'lowerVolume':
      return t('whyBullets.lowerVolume')
    case 'goalFocus':
      return t('whyBullets.goalFocus', {
        goal: labels.goalLabel(String(values.goal)),
      })
    case 'trainingStyleFocus':
      return t('whyBullets.trainingStyleFocus', {
        style: labels.trainingStyleLabel(String(values.style)),
      })
    case 'sustainableRecovery':
      return t('whyBullets.sustainableRecovery')
    case 'progressiveOverload':
      return t('whyBullets.progressiveOverload')
    case 'timeEfficiency':
      return t('whyBullets.timeEfficiency')
    case 'injuryAware':
      return t('whyBullets.injuryAware')
    default:
      return t(`whyBullets.${bullet.id as WhyBulletId}`)
  }
}

export function usePlanAnalysis(
  profile: OnboardingData | null,
  plan: WorkoutPlan | null
) {
  const t = useTranslations('analysis')
  const labels = useOnboardingLabels()

  return useMemo(() => {
    if (!profile || !plan) return null

    const snapshot = buildPlanAnalysis(profile, plan)
    if (!snapshot) return null

    const protocolResolved = resolveProtocolDisplayName(profile, plan)
    let protocolName = plan.planTitle

    if (protocolResolved.name) {
      protocolName = protocolResolved.name
    } else if (protocolResolved.fallbackKey) {
      const shortKey = protocolResolved.fallbackKey.split('.').pop() ?? 'adaptiveProtocol'
      protocolName = t(
        `protocolNames.${shortKey}` as 'protocolNames.adaptiveProtocol'
      )
    }

    return {
      protocolName,
      protocolBadge: t('protocolBadge'),
      whyTitle: t('whyThisPlan'),
      whyIntro: t('whyIntro'),
      whyBullets: snapshot.whyBullets.map((bullet) =>
        translateWhyBullet(t, labels, bullet)
      ),
      scorecardTitle: t('scorecardTitle'),
      scorecardDisclaimer: t('scorecardDisclaimer'),
      scorecard: snapshot.scorecard.map((metric) => ({
        ...metric,
        label: t(`scorecard.${metric.id}`),
      })),
      insightTitle: t('insightTitle'),
      insightText: t(`insights.${snapshot.insight.id}`, snapshot.insight.values ?? {}),
    }
  }, [profile, plan, t, labels])
}
