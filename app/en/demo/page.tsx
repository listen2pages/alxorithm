import { languageAlternates } from '@/i18n/routing';
import { Metadata } from 'next';
import DemoClient from './DemoClient';

export const metadata: Metadata = {
  title: "Hospitality software",
  description: "Try our restaurant management dashboard demo. Sales, kitchen, staff and inventory in one place.",
  alternates: {
    canonical: '/demo', languages: languageAlternates('/demo'),
  },
  openGraph: {
    title: "Restaurant management demo — alxorithm",
    description: "Try our restaurant management dashboard demo. Sales, kitchen, staff and inventory in one place.",
    url: "https://alxorithm.com/demo",
    images: [
      {
        url: '/pages/demo01.png',
        width: 1200,
        height: 630,
        alt: "Restaurant dashboard demo",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Restaurant management demo — alxorithm",
    description: "Try our restaurant management dashboard demo. Sales, kitchen, staff and inventory in one place.",
    images: ['/pages/demo01.png'],
  },
};

export default function DemoPage() {
  return <DemoClient />;
}
