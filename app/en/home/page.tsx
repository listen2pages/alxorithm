import { languageAlternates } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HomeClient from './HomeClient';
export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <HomeClient />;
}
