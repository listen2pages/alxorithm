import { languageAlternates } from '@/i18n/routing';
import { Suspense } from 'react';
import PanelClient from './PanelClient';
export const metadata = {
 alternates: { canonical: "/ru/home/panel", languages: languageAlternates("/home/panel") }, title: "Панель — месячный анализ", robots: { index: false, follow: false } };
export default function PanelPage() {
  return <Suspense fallback={<p role="status" className="p-8">{"Загрузка панели…"}</p>}><PanelClient /></Suspense>;
}
