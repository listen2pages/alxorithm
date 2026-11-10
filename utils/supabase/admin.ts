/**
 * Service-role Supabase client for trusted server-to-server work (Stripe webhooks).
 * Never import this module from client components: the service key bypasses RLS.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function createAdminClient(env: Record<string, string | undefined> = process.env): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
