import { Suspense } from 'react';
import PanelClient from './PanelClient';
export const metadata = { title: 'Panel — analiza miesięczna', robots: { index: false, follow: false } };
export default function PanelPage() {
  return <Suspense fallback={<p role="status" className="p-8">Ładowanie panelu…</p>}><PanelClient /></Suspense>;
}
