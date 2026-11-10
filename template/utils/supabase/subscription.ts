import type { SupabaseClient } from '@supabase/supabase-js';
export async function isSubscriber(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from('subscriptions').select('id').eq('user_id', userId).in('status', ['active', 'trialing']).limit(1);
  if (error) throw new Error('Nie można sprawdzić subskrypcji. Spróbuj ponownie.');
  return Boolean(data?.length);
}
export function safeReturnPath(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') && !/[\\\r\n]/.test(value) ? value : '/cennik';
}
