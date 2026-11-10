import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const metadata: Metadata = {
  title: "Демо панели ресторана — аналитика продаж",
  description: "Посмотрите пример панели продаж ресторана. Анализируйте выручку, товары и каналы заказов в демо.",
  alternates: { canonical: "/ru/demo/panel_demo", languages: languageAlternates("/ru/demo/panel_demo") },
  openGraph: { title: "Демо панели ресторана", description: "Примеры результатов продаж ресторана и интерактивные графики.", url: "/ru/demo/panel_demo" },
};
export default function Layout({ children }: { children: ReactNode }) { return children; }
