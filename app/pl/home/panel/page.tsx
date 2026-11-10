import { languageAlternates } from '@/i18n/routing';
import { Suspense } from 'react';
import PanelClient from './PanelClient';
export const metadata = {
 alternates: { canonical: "/pl/home/panel", languages: languageAlternates("/home/panel") }, title: 'Panel — analiza miesięczna', robots: { index: false, follow: false } };
export default function PanelPage() {
  return <Suspense fallback={<p role="status" className="p-8">{"Ładowanie panelu…"}</p>}><PanelClient /></Suspense>;
}
