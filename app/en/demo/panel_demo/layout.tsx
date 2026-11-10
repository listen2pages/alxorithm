import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const metadata: Metadata = {
  title: "Restaurant dashboard demo — sales analytics",
  description: "Explore a sample restaurant sales dashboard. Analyse revenue, products and order channels in the demo.",
  alternates: { canonical: '/demo/panel_demo', languages: languageAlternates('/demo/panel_demo') },
  openGraph: { title: "Restaurant dashboard demo", description: "Sample restaurant sales results and interactive charts.", url: '/demo/panel_demo' },
};
export default function Layout({ children }: { children: ReactNode }) { return children; }
