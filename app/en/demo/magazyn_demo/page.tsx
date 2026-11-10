import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import InventoryClient from './InventoryClient';
export const metadata: Metadata = {
  title: "Inventory demo — stock, waste and loss costs",
  description: "Try the restaurant inventory demo. Compare actual and expected stock and calculate waste and shortage value.",
  alternates: { canonical: '/demo/magazyn_demo', languages: languageAlternates('/demo/magazyn_demo') },
  openGraph: { title: "Restaurant inventory demo", description: "Stock, waste and loss costs in one demo view.", url: '/demo/magazyn_demo' },
};
export default function Page() { return <InventoryClient />; }
