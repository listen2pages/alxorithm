import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import InventoryClient from './InventoryClient';
export const metadata: Metadata = {
  title: "Демо склада — остатки, отходы и стоимость потерь",
  description: "Попробуйте демо склада ресторана. Сравните фактические и ожидаемые остатки и рассчитайте стоимость отходов и недостач.",
  alternates: { canonical: "/ru/demo/magazyn_demo", languages: languageAlternates("/ru/demo/magazyn_demo") },
  openGraph: { title: "Демо склада ресторана", description: "Остатки, отходы и стоимость потерь в одном демо.", url: "/ru/demo/magazyn_demo" },
};
export default function Page() { return <InventoryClient />; }
