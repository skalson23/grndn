import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { getSupabasePublicEnv } from '@/lib/supabase/config'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/results'
  const save = requestUrl.searchParams.get('save')
  const redirectUrl = new URL(next, request.url)

  if (save) {
    redirectUrl.searchParams.set('save', save)
  }

  const response = NextResponse.redirect(redirectUrl)
  const { url, key } = getSupabasePublicEnv()

  if (!url || !key || !code) {
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  try {
    await supabase.auth.exchangeCodeForSession(code)
  } catch {
    // Keep the lightweight auth flow non-blocking; the destination page can retry.
  }

  return response
}
