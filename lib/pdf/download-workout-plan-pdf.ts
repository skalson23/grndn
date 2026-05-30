import { pdf } from '@react-pdf/renderer'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import type { WorkoutPlan } from '@/lib/workout-plan/schema'

import { WorkoutPlanPdfDocument } from './workout-plan-document'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'workout-plan'
}

import type { AppLocale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

export async function downloadWorkoutPlanPdf(
  plan: WorkoutPlan,
  profile?: OnboardingData | null,
  locale?: AppLocale | string
): Promise<void> {
  const resolvedLocale =
    locale && routing.locales.includes(locale as AppLocale)
      ? (locale as AppLocale)
      : routing.defaultLocale

  const blob = await pdf(
    WorkoutPlanPdfDocument({
      plan,
      profile,
      generatedAt: new Date(),
      locale: resolvedLocale,
    })
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `grndn-${slugify(plan.planTitle)}.pdf`
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
