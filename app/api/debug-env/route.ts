import { NextResponse } from 'next/server'

function maskUrl(raw: string | undefined): string | null {
  if (!raw?.trim()) return null
  const value = raw.trim()
  if (value.length <= 30) return value
  return `${value.slice(0, 30)}…`
}

export async function GET() {
  return NextResponse.json({
    supabase_url: maskUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    has_anon_key: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
    has_service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  })
}
