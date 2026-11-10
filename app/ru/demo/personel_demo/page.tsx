import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import StaffClient from './StaffClient';

export const metadata: Metadata = {
  title: "Демо персонала — график и зарплаты",
  description: "Изучите команду, график и калькулятор зарплат. Сравнивайте часы и затраты в интерактивном демо.",
  alternates: { canonical: "/ru/demo/personel_demo", languages: languageAlternates("/ru/demo/personel_demo") },
  openGraph: { title: "Демо персонала — график и зарплаты", description: "Изучите команду, график и калькулятор зарплат. Сравнивайте часы и затраты в интерактивном демо.", url: "/ru/demo/personel_demo" },
};

export default function Page() { return <StaffClient />; }
