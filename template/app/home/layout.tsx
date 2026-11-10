import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber } from '@/utils/supabase/subscription';
import WorkspaceShell from '@/components/WorkspaceShell';
export const metadata = { title: 'Twój lokal', robots: { index: false, follow: false } };
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if (!await isSubscriber(supabase, user.id)) redirect('/cennik');
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
