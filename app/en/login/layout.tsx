import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "Restaurant dashboard sign-in",
  description: "Sign in to alxorithm to manage your restaurant.",
  alternates: { canonical: '/login', languages: languageAlternates('/login') },
  openGraph: { title: "Restaurant dashboard sign-in", description: "Sign in to alxorithm to manage your restaurant.", url: '/login' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
