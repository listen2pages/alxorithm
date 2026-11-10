import serviceMessages from './service-messages.json';
import type { Locale } from './routing';
import { globalMessages } from './global-messages';

const dictionaries: Record<'en' | 'ru', Record<string, string>> = serviceMessages;

export function translate(text: string, locale: Locale): string {
  if (locale !== 'en' && globalMessages[text]) {
    return globalMessages[text][locale];
  }
  if (locale !== 'en') {
    const prefix = Object.keys(globalMessages).find(k => k.endsWith(' ') && text.startsWith(k));
    if (prefix) return globalMessages[prefix][locale] + text.slice(prefix.length);
  }
  if (locale === 'pl') return text;
  const dictionary = dictionaries[locale];
  if (dictionary[text]) return dictionary[text];
  // Validation messages may append an unchanged user-entered name or number.
  const prefix = Object.keys(dictionary)
    .filter(key => key.endsWith(' ') || key.endsWith(':'))
    .sort((a, b) => b.length - a.length)
    .find(key => text.startsWith(key));
  return prefix ? dictionary[prefix] + text.slice(prefix.length) : text;
}
