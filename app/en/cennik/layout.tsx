import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "Plan — PLN 400 / month",
  description: "Full access to restaurant management tools for PLN 400 monthly. Start with a 7-day free trial.",
  alternates: { canonical: '/cennik', languages: languageAlternates('/cennik') },
  openGraph: {
    title: "Plan — PLN 400 / month — alxorithm",
    description: "Full access to restaurant management tools for PLN 400 monthly. Start with a 7-day free trial.",
    url: '/cennik',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
