/** Client-safe Supabase env (NEXT_PUBLIC_* only). Server secrets live in admin.ts. */
export {
  getSupabaseAuthEndpoint,
  getSupabasePublicEnv,
  isSupabaseConfigured,
  normalizeSupabaseProjectUrl,
} from './env.public'
