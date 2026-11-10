import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Oferta — 400 zł / miesiąc',
  description: 'Pełny dostęp do narzędzi zarządzania restauracją za 400 zł miesięcznie. 7 dni bezpłatnego okresu próbnego — zacznij bez ryzyka.',
  alternates: { canonical: '/cennik' },
  openGraph: {
    title: 'Oferta — 400 zł / miesiąc | Jedzenie Warszawa',
    description: 'Pełny dostęp do narzędzi zarządzania restauracją za 400 zł miesięcznie. 7 dni bezpłatnego okresu próbnego — zacznij bez ryzyka.',
    url: '/cennik',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
