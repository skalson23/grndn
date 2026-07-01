const AUTH_RETURN_PATH_KEY = 'grndn_auth_return_path_v1'

export function writeAuthReturnPath(path: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(AUTH_RETURN_PATH_KEY, path)
    sessionStorage.setItem(AUTH_RETURN_PATH_KEY, path)
  } catch {
    // Storage may be unavailable in private mode.
  }
}

export function readAuthReturnPath(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return sessionStorage.getItem(AUTH_RETURN_PATH_KEY) ?? localStorage.getItem(AUTH_RETURN_PATH_KEY)
  } catch {
    return null
  }
}

export function clearAuthReturnPath(): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(AUTH_RETURN_PATH_KEY)
    localStorage.removeItem(AUTH_RETURN_PATH_KEY)
  } catch {
    // ignore
  }
}
