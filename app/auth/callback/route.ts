import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { completePendingProgramSave } from '@/lib/programs/complete-pending-save'
import { logSaveFlow, logSaveFlowError, logSaveFlowWarn } from '@/lib/programs/save-flow-log'
import { BETA_ACCESS_COOKIE } from '@/lib/billing/constants'
import { syncBetaAccessFromCookie } from '@/lib/billing/subscriptions'
import { defaultLocaleResultsPath, routing } from '@/i18n/routing'
import { getSupabasePublicEnv } from '@/lib/supabase/config'

function sanitizeNextPath(raw: string | null): string {
  const fallback = defaultLocaleResultsPath

  if (!raw) return fallback

  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback

  const localeMatch = trimmed.match(/^\/(en|pl)(\/|$)/)
  if (!localeMatch || !routing.locales.includes(localeMatch[1] as (typeof routing.locales)[number])) {
    return fallback
  }

  return trimmed
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = sanitizeNextPath(requestUrl.searchParams.get('next'))
  const save = requestUrl.searchParams.get('save')
  const redirectUrl = new URL(next, request.url)

  logSaveFlow('auth_callback_start', {
    hasCode: Boolean(code),
    next,
    save,
  })

  if (save) {
    redirectUrl.searchParams.set('save', save)
  }

  const response = NextResponse.redirect(redirectUrl)
  const { url, key } = getSupabasePublicEnv()

  if (!url || !key || !code) {
    logSaveFlowWarn('auth_callback_missing_code_or_supabase', {
      hasCode: Boolean(code),
      hasSupabase: Boolean(url && key),
    })
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  try {
    await supabase.auth.exchangeCodeForSession(code)
    logSaveFlow('auth_callback_session_exchanged')
  } catch (error) {
    logSaveFlowError('auth_callback_session_exchange_failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return response
  }

  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser()

  if (sessionUser?.email) {
    const hasBetaCookie =
      request.cookies.get(BETA_ACCESS_COOKIE)?.value === 'true'
    await syncBetaAccessFromCookie(sessionUser.id, sessionUser.email, hasBetaCookie)
  }

  if (save === '1') {
    const user = sessionUser

    if (!user?.email) {
      logSaveFlowWarn('auth_callback_save_skipped_no_user', {})
      return response
    }

    const result = await completePendingProgramSave(user.email, user.id)
    logSaveFlow('auth_callback_pending_save_result', {
      saved: result.saved,
      reason: result.reason,
      userId: user.id,
    })

    if (result.saved) {
      redirectUrl.searchParams.delete('save')
      const savedResponse = NextResponse.redirect(redirectUrl)
      response.cookies.getAll().forEach(({ name, value, ...options }) => {
        savedResponse.cookies.set(name, value, options)
      })
      return savedResponse
    }
  }

  return response
}
