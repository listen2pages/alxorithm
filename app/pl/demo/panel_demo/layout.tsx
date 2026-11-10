import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const metadata: Metadata = {
  title: 'Demo panelu restauracji — analityka sprzedaży',
  description: 'Poznaj przykładowy panel sprzedaży restauracji. Analizuj przychód, produkty i kanały zamówień w wersji demonstracyjnej.',
  alternates: { canonical: "/pl/demo/panel_demo", languages: languageAlternates("/pl/demo/panel_demo") },
  openGraph: { title: 'Demo panelu restauracji', description: 'Przykładowe wyniki sprzedaży i interaktywne wykresy restauracji.', url: "/pl/demo/panel_demo" },
};
export default function Layout({ children }: { children: ReactNode }) { return children; }
