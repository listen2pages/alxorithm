export const locales = ['en', 'pl', 'ru'] as const;
export type Locale = typeof locales[number];
export const BASE_URL = 'https://alxorithm.com';
export function localeFromPath(path: string): Locale {
  const first = path.split('/')[1];
  return locales.includes(first as Locale) ? first as Locale : 'en';
}
export function stripLocale(path: string) { return path.replace(/^\/(en|pl|ru)(?=\/|$)/, '') || '/'; }
export function localizedPath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || path.startsWith('//') || /^\/(api|auth|_next)(\/|$)/.test(path)) return path;
  if (/^\/(en|pl|ru)(\/|$)/.test(path)) return path;
  return locale === 'en' ? path : '/' + locale + (path === '/' ? '' : path);
}
export function languageAlternates(path: string) {
  if(path.startsWith('https://')) path = new URL(path).pathname;
  path = stripLocale(path);
  return Object.fromEntries([...locales.map(l => [l, BASE_URL + localizedPath(path, l)]), ['x-default', BASE_URL + path]]);
}
