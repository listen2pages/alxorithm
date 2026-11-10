/**
 * Per-user budget for paid Gemini / Google Search Grounding calls.
 *
 * Two layers protect the AI bill:
 *  1. A durable daily quota enforced atomically in Postgres (`public.consume_ai_quota`,
 *     see supabase/ai_usage_quota.sql). Trial users get a smaller allowance.
 *  2. A per-instance burst limiter that blocks rapid-fire loops before they reach the DB.
 */
export type AiKind = 'panel_map' | 'kitchen_analyze' | 'kitchen_estimate';

/** Daily limits per user. Grounded price estimation runs in batches, so it gets more calls. */
export const AI_DAILY_LIMITS: Record<AiKind, number> = {
  panel_map: 30,
  kitchen_analyze: 15,
  kitchen_estimate: 120,
};

export const AI_LIMIT_MESSAGE = 'Dzienny limit operacji AI został wykorzystany. Spróbuj ponownie jutro.';
export const AI_BURST_MESSAGE = 'Zbyt wiele operacji AI w krótkim czasie. Odczekaj chwilę i spróbuj ponownie.';

const BURST_WINDOW_MS = 60_000;
const BURST_LIMIT = 20;
const recent = new Map<string, number[]>();

/** Resets in-memory burst counters (used by unit tests). */
export function resetAiBurst(): void {
  recent.clear();
}

/** Returns false when the user exceeded the short-term burst budget on this server instance. */
export function allowBurst(userId: string, now = Date.now()): boolean {
  const hits = (recent.get(userId) || []).filter(time => now - time < BURST_WINDOW_MS);
  if (hits.length >= BURST_LIMIT) {
    recent.set(userId, hits);
    return false;
  }
  hits.push(now);
  recent.set(userId, hits);
  if (recent.size > 5000) {
    for (const [key, times] of recent) {
      if (!times.some(time => now - time < BURST_WINDOW_MS)) recent.delete(key);
    }
  }
  return true;
}

type RpcClient = {
  rpc?: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { code?: string; message?: string } | null }>;
};

export type AiQuotaResult = { allowed: true } | { allowed: false; message: string };

/**
 * Consumes one unit of the user's daily AI budget.
 * When the quota function has not been deployed yet, the durable check degrades
 * gracefully (burst limiting still applies) so existing deployments keep working.
 */
export async function consumeAiQuota(
  supabase: RpcClient,
  userId: string,
  kind: AiKind,
  options?: { enforceDb?: boolean; now?: number },
): Promise<AiQuotaResult> {
  if (!allowBurst(userId, options?.now)) return { allowed: false, message: AI_BURST_MESSAGE };
  const enforceDb = options?.enforceDb ?? Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!enforceDb || typeof supabase.rpc !== 'function') return { allowed: true };
  const { data, error } = await supabase.rpc('consume_ai_quota', {
    p_kind: kind,
    p_daily_limit: AI_DAILY_LIMITS[kind],
  });
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') {
      return { allowed: true };
    }
    throw new Error('Nie można sprawdzić limitu AI. Spróbuj ponownie.');
  }
  return data === false ? { allowed: false, message: AI_LIMIT_MESSAGE } : { allowed: true };
}
