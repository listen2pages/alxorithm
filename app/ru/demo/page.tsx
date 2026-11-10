import { languageAlternates } from '@/i18n/routing';
import { Metadata } from 'next';
import DemoClient from './DemoClient';

export const metadata: Metadata = {
  title: "Программа для общепита",
  description: "Попробуйте демо панели управления рестораном. Продажи, кухня, персонал и склад в одном месте.",
  alternates: {
    canonical: "/ru/demo", languages: languageAlternates("/ru/demo"),
  },
  openGraph: {
    title: "Демо управления рестораном — alxorithm",
    description: "Попробуйте демо панели управления рестораном. Продажи, кухня, персонал и склад в одном месте.",
    url: "https://alxorithm.com/ru/demo",
    images: [
      {
        url: "/ru/pages/demo01.png",
        width: 1200,
        height: 630,
        alt: "Демо панели ресторана",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Демо управления рестораном — alxorithm",
    description: "Попробуйте демо панели управления рестораном. Продажи, кухня, персонал и склад в одном месте.",
    images: ['/pages/demo01.png'],
  },
};

export default function DemoPage() {
  return <DemoClient />;
}
