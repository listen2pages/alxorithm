import { languageAlternates } from '@/i18n/routing';
import { Metadata } from 'next';
import DemoClient from './DemoClient';

export const metadata: Metadata = {
  title: 'Oprogramowanie dla Gastronomii',
  description: 'Wypróbuj wersję demonstracyjną naszego zaawansowanego panelu do zarządzania restauracją. Panel sprzedaży, kuchnia, personel i magazyn w jednym miejscu.',
  alternates: {
    canonical: "/pl/demo", languages: languageAlternates("/pl/demo"),
  },
  openGraph: {
    title: "Demo zarządzania restauracją | alxorithm",
    description: 'Wypróbuj wersję demonstracyjną naszego zaawansowanego panelu do zarządzania restauracją. Panel sprzedaży, kuchnia, personel i magazyn w jednym miejscu.',
    url: "https://alxorithm.com/pl/demo",
    images: [
      {
        url: "/pl/pages/demo01.png",
        width: 1200,
        height: 630,
        alt: 'Demo Panelu Restauracyjnego',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Demo zarządzania restauracją | alxorithm",
    description: 'Wypróbuj wersję demonstracyjną naszego zaawansowanego panelu do zarządzania restauracją. Panel sprzedaży, kuchnia, personel i magazyn w jednym miejscu.',
    images: ['/pages/demo01.png'],
  },
};

export default function DemoPage() {
  return <DemoClient />;
}
