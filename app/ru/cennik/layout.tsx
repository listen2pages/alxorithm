import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "Тариф — 400 PLN / месяц",
  description: "Полный доступ к инструментам управления рестораном за 400 PLN в месяц. Начните с 7 дней бесплатно.",
  alternates: { canonical: "/ru/cennik", languages: languageAlternates("/ru/cennik") },
  openGraph: {
    title: "Тариф — 400 PLN / месяц — alxorithm",
    description: "Полный доступ к инструментам управления рестораном за 400 PLN в месяц. Начните с 7 дней бесплатно.",
    url: "/ru/cennik",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
