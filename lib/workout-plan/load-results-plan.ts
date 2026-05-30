'use client'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import type { AppLocale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import {
  getCurrentMagicLinkUser,
  listSavedPrograms,
} from '@/lib/programs/saved-programs'
import { logSaveFlow, logSaveFlowError, logSaveFlowWarn } from '@/lib/programs/save-flow-log'
import {
  hydrateSessionFromPayload,
  readLocalPendingPlanPayload,
  readSessionPlanPayload,
} from '@/lib/workout-plan/pending-save-storage'
import { workoutPlanSchema, type WorkoutPlan } from '@/lib/workout-plan/schema'

export type LoadedResultsPayload = {
  plan: WorkoutPlan
  profile: OnboardingData | null
  locale: AppLocale
  source: 'session_storage' | 'local_storage_pending' | 'saved_programs'
}

function resolveLoadedLocale(
  storedLocale: AppLocale | undefined,
  pathLocale?: AppLocale
): AppLocale {
  if (storedLocale && routing.locales.includes(storedLocale)) {
    return storedLocale
  }
  if (pathLocale && routing.locales.includes(pathLocale)) {
    return pathLocale
  }
  return routing.defaultLocale
}

function localeFromPathname(): AppLocale | undefined {
  if (typeof window === 'undefined') return undefined
  const segment = window.location.pathname.split('/').filter(Boolean)[0]
  return routing.locales.includes(segment as AppLocale)
    ? (segment as AppLocale)
    : undefined
}

export async function loadResultsPlan(): Promise<LoadedResultsPayload | null> {
  logSaveFlow('results_load_start')

  const pathLocale = localeFromPathname()

  const sessionPayload = readSessionPlanPayload()
  if (sessionPayload) {
    const checked = workoutPlanSchema.safeParse(sessionPayload.plan)
    if (checked.success) {
      logSaveFlow('results_loaded', { source: 'session_storage' })
      return {
        plan: checked.data,
        profile: sessionPayload.profile,
        locale: resolveLoadedLocale(sessionPayload.locale, pathLocale),
        source: 'session_storage',
      }
    }
    logSaveFlowWarn('results_session_storage_invalid_plan')
  } else {
    logSaveFlowWarn('results_session_storage_missing')
  }

  const pendingPayload = readLocalPendingPlanPayload()
  if (pendingPayload) {
    const checked = workoutPlanSchema.safeParse(pendingPayload.plan)
    if (checked.success) {
      hydrateSessionFromPayload(pendingPayload)
      logSaveFlow('results_loaded', { source: 'local_storage_pending' })
      return {
        plan: checked.data,
        profile: pendingPayload.profile,
        locale: resolveLoadedLocale(pendingPayload.locale, pathLocale),
        source: 'local_storage_pending',
      }
    }
    logSaveFlowWarn('results_local_storage_invalid_plan')
  } else {
    logSaveFlowWarn('results_local_storage_pending_missing')
  }

  try {
    const user = await getCurrentMagicLinkUser()
    if (!user) {
      logSaveFlowWarn('results_saved_programs_skipped_no_session')
    } else {
      const programs = await listSavedPrograms()
      if (programs.length > 0) {
        const latest = programs[0]
        hydrateSessionFromPayload({
          plan: latest.plan,
          profile: latest.profile,
          locale: pathLocale,
        })
        logSaveFlow('results_loaded', {
          source: 'saved_programs',
          programId: latest.id,
        })
        return {
          plan: latest.plan,
          profile: latest.profile,
          locale: resolveLoadedLocale(undefined, pathLocale),
          source: 'saved_programs',
        }
      }
      logSaveFlowWarn('results_saved_programs_empty', { userId: user.id })
    }
  } catch (error) {
    logSaveFlowError('results_saved_programs_load_failed', {
      message: error instanceof Error ? error.message : String(error),
    })
  }

  logSaveFlowError('results_load_failed_all_sources')
  return null
}
