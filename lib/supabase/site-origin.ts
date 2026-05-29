export const PRODUCTION_SITE_ORIGIN = 'https://grndn.app'

const LOCAL_DEV_ORIGIN = 'http://localhost:3000'

function isLocalhostHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')
  )
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    return isLocalhostHostname(new URL(origin).hostname)
  } catch {
    return false
  }
}

function isProductionDeploy(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  )
}

/**
 * Origin used for Supabase emailRedirectTo / auth callbacks.
 * Production always resolves to https://grndn.app — never localhost.
 */
export function getAuthRedirectOrigin(request?: Request): string {
  if (isProductionDeploy()) {
    const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '')
    if (envOrigin && !isLocalhostOrigin(envOrigin)) {
      return envOrigin
    }
    return PRODUCTION_SITE_ORIGIN
  }

  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '')
  if (envOrigin) {
    return envOrigin
  }

  if (request) {
    const headerOrigin = request.headers.get('origin')?.trim()
    if (headerOrigin) {
      return headerOrigin.replace(/\/+$/, '')
    }
    try {
      return new URL(request.url).origin
    } catch {
      // fall through
    }
  }

  return LOCAL_DEV_ORIGIN
}

export function buildAuthCallbackUrl(
  request: Request,
  options: { next?: string; saveCurrentProgram?: boolean } = {}
): string {
  const origin = getAuthRedirectOrigin(request)
  const callbackUrl = new URL('/auth/callback', origin)
  callbackUrl.searchParams.set('next', options.next ?? '/results')
  if (options.saveCurrentProgram) {
    callbackUrl.searchParams.set('save', '1')
  }
  return callbackUrl.toString()
}
