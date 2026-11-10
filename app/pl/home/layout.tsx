import { languageAlternates } from '@/i18n/routing';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber } from '@/utils/supabase/subscription';
import WorkspaceShell from '@/components/WorkspaceShell';
export const metadata = {
 alternates: { canonical: "/pl/home", languages: languageAlternates("/home") }, title: 'Twój lokal', robots: { index: false, follow: false } };
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pl/login");
  if (!await isSubscriber(supabase, user.id)) redirect("/pl/cennik");
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
