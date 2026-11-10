import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Logowanie do panelu restauracji',
  description: "Zaloguj się do alxorithm, aby zarządzać swoją restauracją.",
  alternates: { canonical: "/pl/login", languages: languageAlternates("/pl/login") },
  openGraph: { title: 'Logowanie do panelu restauracji', description: "Zaloguj się do alxorithm, aby zarządzać swoją restauracją.", url: "/pl/login" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
