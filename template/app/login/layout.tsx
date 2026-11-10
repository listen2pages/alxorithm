import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Logowanie do panelu restauracji',
  description: 'Zaloguj się do Jedzenie Warszawa, aby zarządzać swoją restauracją.',
  alternates: { canonical: '/login' },
  openGraph: { title: 'Logowanie do panelu restauracji', description: 'Zaloguj się do Jedzenie Warszawa, aby zarządzać swoją restauracją.', url: '/login' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
