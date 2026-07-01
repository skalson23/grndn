import type { User } from '@supabase/supabase-js'

import { isSupabaseConfigured } from '@/lib/supabase/env.public'

import type { SaveProgramInput, SavedProgram } from './saved-program-models'

export type { PdfMetadata, SaveProgramInput, SavedProgram } from './saved-program-models'
export { buildPdfMetadata } from './saved-program-models'

async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string }
    return body.error ?? fallback
  } catch {
    return fallback
  }
}

/** Resolves the signed-in magic-link user via the server session route. */
export async function getCurrentMagicLinkUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null

  const res = await fetch('/api/auth/session', { cache: 'no-store' })
  if (!res.ok) return null

  const body = (await res.json()) as { user?: User | null }
  return body.user?.email ? body.user : null
}

export async function sendMagicLink(
  email: string,
  options: {
    next?: string
    saveCurrentProgram?: boolean
    plan?: SaveProgramInput['plan']
    profile?: SaveProgramInput['profile']
  } = {}
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured for saving programs.')
  }

  const res = await fetch('/api/auth/magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      next: options.next,
      saveCurrentProgram: options.saveCurrentProgram,
      plan: options.plan,
      profile: options.profile,
    }),
  })

  if (!res.ok) {
    throw new Error(await readApiError(res, 'Could not send magic link.'))
  }
}

export async function saveProgramToAccount({
  plan,
  profile = null,
}: SaveProgramInput): Promise<SavedProgram> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured for saving programs.')
  }

  const res = await fetch('/api/programs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, profile }),
  })

  if (!res.ok) {
    throw new Error(await readApiError(res, 'Could not save this program.'))
  }

  const body = (await res.json()) as { program: SavedProgram }
  return body.program
}

export async function listSavedPrograms(): Promise<SavedProgram[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured for saved programs.')
  }

  const res = await fetch('/api/programs', { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(await readApiError(res, 'Could not load saved programs.'))
  }

  const body = (await res.json()) as { programs: SavedProgram[] }
  return body.programs
}
