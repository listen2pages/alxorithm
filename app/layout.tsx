import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, Cormorant_Garamond, Fredoka, Plus_Jakarta_Sans, Spline_Sans } from 'next/font/google';
import EnglishNav from '@/localized/en/components/LandingNav';
import PolishNav from '@/localized/pl/components/LandingNav';
import RussianNav from '@/localized/ru/components/LandingNav';
import { BASE_URL, type Locale } from '@/i18n/routing';
import './en/globals.css';
import './en/demo/demo.css';
import './localization.css';
import './workspace.css';
const inter=Inter({subsets:['latin','latin-ext','cyrillic'],variable:'--font-sans'});
const cormorant=Cormorant_Garamond({subsets:['latin','latin-ext','cyrillic'],weight:['300','400','500','600','700'],variable:'--font-serif'});
const fredoka=Fredoka({subsets:['latin','latin-ext'],weight:['400','500','600','700'],variable:'--font-display'});
const jakarta=Plus_Jakarta_Sans({subsets:['latin','latin-ext'],weight:['400','500','600','700'],variable:'--font-jakarta'});
const spline=Spline_Sans({subsets:['latin','latin-ext'],weight:['700'],variable:'--font-spline'});
const descriptions={en:'Manage your restaurant, café and bar in one place. POS analysis, recipe costs, inventory, staff schedules and pay.',pl:'Zarządzaj restauracją, kawiarnią i barem w jednym miejscu. Analiza POS, koszty receptur, magazyn oraz grafik i wynagrodzenia personelu.',ru:'Управляйте рестораном, кафе и баром в одном месте. Анализ POS, себестоимость рецептур, склад, график и зарплаты персонала.'};
export async function generateMetadata(): Promise<Metadata> {
  const locale=((await headers()).get('x-alxorithm-locale')||'en') as Locale;
  const title={en:'Restaurant management software',pl:'Oprogramowanie dla Gastronomii',ru:'Программа для управления рестораном'}[locale];
  return {metadataBase:new URL(BASE_URL),title:{default:`alxorithm — ${title}`,template:'%s — alxorithm'},description:descriptions[locale],openGraph:{siteName:'alxorithm',type:'website',locale:{en:'en_GB',pl:'pl_PL',ru:'ru_RU'}[locale],alternateLocale:['en_GB','pl_PL','ru_RU'].filter(l=>l!=={en:'en_GB',pl:'pl_PL',ru:'ru_RU'}[locale])},appleWebApp:{title:'alxorithm',statusBarStyle:'default'}};
}
export default async function RootLayout({children}:{children:React.ReactNode}) {
  const locale=((await headers()).get('x-alxorithm-locale')||'en') as Locale;
  const Nav={en:EnglishNav,pl:PolishNav,ru:RussianNav}[locale];
  return <html lang={locale} className={`${inter.variable} ${cormorant.variable} ${fredoka.variable} ${jakarta.variable} ${spline.variable}`}><body className="font-sans bg-brand-beige text-brand-brown antialiased pb-24 lg:pb-0" suppressHydrationWarning><Nav/>{children}</body></html>;
}
