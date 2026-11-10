import type { MetadataRoute } from 'next';
import { BASE_URL, locales, localizedPath, languageAlternates } from '@/i18n/routing';
export default function sitemap(): MetadataRoute.Sitemap {
  const routes=['/','/cennik','/demo','/regulamin','/polityka-prywatnosci','/demo/panel_demo','/demo/kuchnia_demo','/demo/personel_demo','/demo/magazyn_demo'];
  return [...new Set(routes)].flatMap(route=>locales.map(locale=>({url:BASE_URL+localizedPath(route,locale),changeFrequency:route==='/'?'daily' as const:'monthly' as const,priority:route==='/'?1:0.7,alternates:{languages:languageAlternates(route)}})));
}
