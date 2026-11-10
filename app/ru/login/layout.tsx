import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "Вход в панель ресторана",
  description: "Войдите в alxorithm для управления рестораном.",
  alternates: { canonical: "/ru/login", languages: languageAlternates("/ru/login") },
  openGraph: { title: "Вход в панель ресторана", description: "Войдите в alxorithm для управления рестораном.", url: "/ru/login" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
