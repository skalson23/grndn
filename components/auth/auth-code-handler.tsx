'use client'

import { useEffect, useRef } from 'react'

import { readAuthReturnPath } from '@/lib/auth/auth-return-path'

function localeFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|pl)(\/|$)/)
  return match?.[1] ?? 'en'
}

/**
 * Supabase may deliver magic-link codes to the Site URL (e.g. /en) instead of
 * /auth/callback. Forward those codes to the callback route with the saved return path.
 */
export function AuthCodeHandler() {
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return

    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (!code || url.pathname === '/auth/callback') return

    handledRef.current = true

    const returnPath =
      readAuthReturnPath() ?? `/${localeFromPathname(url.pathname)}/assessment`

    const callback = new URL('/auth/callback', url.origin)
    callback.searchParams.set('code', code)
    callback.searchParams.set('next', returnPath)

    const save = url.searchParams.get('save')
    if (save) {
      callback.searchParams.set('save', save)
    }

    window.location.replace(callback.toString())
  }, [])

  return null
}
