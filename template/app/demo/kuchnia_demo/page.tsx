import type { Metadata } from 'next';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: 'Demo kuchni — receptury i koszty porcji',
  description: 'Poznaj przykładowe karty dań, receptury, koszty składników oraz marże. Odkryj możliwości zarządzania kuchnią.',
  alternates: { canonical: '/demo/kuchnia_demo' },
  openGraph: { title: 'Demo kuchni — receptury i koszty porcji', description: 'Poznaj przykładowe karty dań, receptury, koszty składników oraz marże. Odkryj możliwości zarządzania kuchnią.', url: '/demo/kuchnia_demo' },
};

export default function Page() { return <MenuClient />; }
