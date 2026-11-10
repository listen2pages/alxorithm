import type { Metadata } from 'next';
import InventoryClient from './InventoryClient';
export const metadata: Metadata = {
  title: 'Demo magazynu — zapasy, odpady i koszty strat',
  description: 'Sprawdź demo magazynu restauracji. Porównaj stan rzeczywisty z oczekiwanym i oblicz wartość odpadów oraz braków.',
  alternates: { canonical: '/demo/magazyn_demo' },
  openGraph: { title: 'Demo magazynu restauracji', description: 'Zapasy, odpady i koszt strat w jednym widoku demonstracyjnym.', url: '/demo/magazyn_demo' },
};
export default function Page() { return <InventoryClient />; }
