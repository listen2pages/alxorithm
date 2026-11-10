import type { Metadata } from 'next';
import StaffClient from './StaffClient';

export const metadata: Metadata = {
  title: 'Demo personelu — grafik i wynagrodzenia',
  description: 'Przeglądaj zespół, grafik pracy i kalkulator wynagrodzeń. Porównuj godziny i koszty w interaktywnej wersji demonstracyjnej.',
  alternates: { canonical: '/demo/personel_demo' },
  openGraph: { title: 'Demo personelu — grafik i wynagrodzenia', description: 'Przeglądaj zespół, grafik pracy i kalkulator wynagrodzeń. Porównuj godziny i koszty w interaktywnej wersji demonstracyjnej.', url: '/demo/personel_demo' },
};

export default function Page() { return <StaffClient />; }
