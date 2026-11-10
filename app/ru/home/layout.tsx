import { languageAlternates } from '@/i18n/routing';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isSubscriber } from '@/utils/supabase/subscription';
import WorkspaceShell from '@/components/WorkspaceShell';
export const metadata = {
 alternates: { canonical: "/ru/home", languages: languageAlternates("/home") }, title: "Ваше заведение", robots: { index: false, follow: false } };
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ru/login");
  if (!await isSubscriber(supabase, user.id)) redirect("/ru/cennik");
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
