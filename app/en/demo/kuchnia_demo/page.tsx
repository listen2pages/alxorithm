import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: "Kitchen demo — recipes and portion costs",
  description: "Explore sample dish cards, recipes, ingredient costs and margins. Discover kitchen management tools.",
  alternates: { canonical: '/demo/kuchnia_demo', languages: languageAlternates('/demo/kuchnia_demo') },
  openGraph: { title: "Kitchen demo — recipes and portion costs", description: "Explore sample dish cards, recipes, ingredient costs and margins. Discover kitchen management tools.", url: '/demo/kuchnia_demo' },
};

export default function Page() { return <MenuClient />; }
