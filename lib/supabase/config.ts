const SUPABASE_PROJECT_HOST_SUFFIX = '.supabase.co'

/**
 * Normalizes NEXT_PUBLIC_SUPABASE_URL for @supabase/ssr / auth-js.
 * Must be the project root (https://<ref>.supabase.co) — never /rest/v1 or .supabase.com.
 *
 * Auth client appends /auth/v1/* itself. A /rest/v1 suffix produces broken paths like:
 * https://<ref>.supabase.co/rest/v1/auth/v1/otp → 404
 */
export function normalizeSupabaseProjectUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl?.trim()) return undefined

  let url = rawUrl.trim().replace(/\/+$/, '')

  // Strip PostgREST suffix if pasted from the wrong dashboard field.
  url = url.replace(/\/rest\/v1\/?$/i, '')

  try {
    const parsed = new URL(url)

    if (parsed.hostname.endsWith('.supabase.com')) {
      parsed.hostname = parsed.hostname.replace(/\.supabase\.com$/i, SUPABASE_PROJECT_HOST_SUFFIX)
    }

    const normalized = parsed.origin

    if (rawUrl.trim() !== normalized) {
      console.warn('[GRNDN supabase] Normalized NEXT_PUBLIC_SUPABASE_URL', {
        raw: rawUrl.trim(),
        normalized,
        hint: 'Use project root only: https://<ref>.supabase.co (no /rest/v1)',
      })
    }

    return normalized
  } catch {
    console.error('[GRNDN supabase] Invalid NEXT_PUBLIC_SUPABASE_URL:', rawUrl)
    return undefined
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabasePublicEnv()
  return Boolean(url && key)
}

export function getSupabasePublicEnv() {
  const url = normalizeSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return { url, key }
}

/** Expected auth endpoint, e.g. https://<ref>.supabase.co/auth/v1/otp */
export function getSupabaseAuthEndpoint(
  projectUrl: string | undefined,
  path: string
): string | undefined {
  if (!projectUrl) return undefined
  return `${projectUrl.replace(/\/+$/, '')}/auth/v1/${path.replace(/^\/+/, '')}`
}
