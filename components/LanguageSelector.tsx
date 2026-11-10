'use client';
import { usePathname } from 'next/navigation';
import { localeFromPath, localizedPath, stripLocale, type Locale } from '@/i18n/routing';
export default function LanguageSelector() {
  const pathname = usePathname() || '/', locale = localeFromPath(pathname);
  return <select aria-label={{ en: 'Language', pl: 'Język', ru: 'Язык' }[locale]} value={locale} className="language-selector" onChange={event => {
    const next = event.target.value as Locale;
    document.cookie = `alxorithm-locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    window.location.assign(localizedPath(stripLocale(pathname), next) + window.location.search + window.location.hash);
  }}><option value="en" lang="en">English</option><option value="pl" lang="pl">Polski</option><option value="ru" lang="ru">Русский</option></select>;
}
