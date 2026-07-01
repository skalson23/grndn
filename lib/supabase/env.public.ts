const SUPABASE_PROJECT_HOST_SUFFIX = '.supabase.co'

/**
 * Normalizes NEXT_PUBLIC_SUPABASE_URL for @supabase/ssr / auth-js.
 * Must be the project root (https://<ref>.supabase.co) — never /rest/v1 or .supabase.com.
 */
export function normalizeSupabaseProjectUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl?.trim()) return undefined

  let url = rawUrl.trim().replace(/\/+$/, '')
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

export function getSupabasePublicEnv() {
  const url = normalizeSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return { url, key }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabasePublicEnv()
  return Boolean(url && key)
}

/** Expected auth endpoint, e.g. https://<ref>.supabase.co/auth/v1/otp */
export function getSupabaseAuthEndpoint(
  projectUrl: string | undefined,
  path: string
): string | undefined {
  if (!projectUrl) return undefined
  return `${projectUrl.replace(/\/+$/, '')}/auth/v1/${path.replace(/^\/+/, '')}`
}

/**
 * Rejects secret / service_role keys before createBrowserClient().
 * Supabase returns "Forbidden use of secret API key in browser" when a secret key is used client-side.
 */
export function assertBrowserSafeSupabaseKey(key: string): void {
  const trimmed = key.trim()

  if (trimmed.startsWith('sb_secret_')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY must be the publishable (anon) key — not a Supabase secret key.'
    )
  }

  if (trimmed.startsWith('sk_')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is set to a Stripe secret key. Use the Supabase anon/publishable key instead.'
    )
  }

  if (!trimmed.startsWith('eyJ')) {
    return
  }

  try {
    const segment = trimmed.split('.')[1]
    if (!segment) return

    const payload = JSON.parse(
      atob(segment.replace(/-/g, '+').replace(/_/g, '/'))
    ) as { role?: string }

    if (payload.role === 'service_role') {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_ANON_KEY must be the anon key — not the service_role key.'
      )
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('service_role')) {
      throw error
    }
  }
}
