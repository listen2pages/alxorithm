import type {Metadata} from 'next';
import { Inter, Cormorant_Garamond, Fredoka, Plus_Jakarta_Sans, Spline_Sans } from 'next/font/google';
import './globals.css';
import './demo/demo.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

const spline = Spline_Sans({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-spline',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.jedzeniewarszawa.pl'),
  title: {
    default: 'Jedzenie Warszawa | Oprogramowanie dla Gastronomii',
    template: '%s | Jedzenie Warszawa'
  },
  description: 'Zarządzaj restauracją, kawiarnią i barem w jednym miejscu. Analiza POS, koszty receptur, magazyn oraz grafik i wynagrodzenia personelu.',
  openGraph: {
    title: 'Jedzenie Warszawa | Oprogramowanie dla Gastronomii',
    description: 'Zarządzaj restauracją, kawiarnią i barem w jednym miejscu. Analiza POS, koszty receptur, magazyn oraz grafik i wynagrodzenia personelu.',
    url: 'https://www.jedzeniewarszawa.pl',
    siteName: 'Jedzenie Warszawa',
    locale: 'pl_PL',
    type: 'website',
  },
  appleWebApp: {
    title: 'jedzenie warszawa',
    statusBarStyle: 'default',
  },
};

import LandingNav from '@/components/LandingNav';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pl" className={`${inter.variable} ${cormorant.variable} ${fredoka.variable} ${jakarta.variable} ${spline.variable}`}>
      <body className="font-sans bg-brand-beige text-brand-brown antialiased pb-24 lg:pb-0" suppressHydrationWarning>
        <LandingNav />
        {children}
      </body>
    </html>
  );
}
