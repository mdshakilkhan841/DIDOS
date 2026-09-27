import enDict from '@/locales/en.json';
import bnDict from '@/locales/bn.json';

export type Locale = 'en' | 'bn';

export const dictionaries = {
  en: enDict,
  bn: bnDict,
} as const;

export function getDictionary(lang: string = 'en') {
  const normalizedLang: Locale = lang === 'bn' ? 'bn' : 'en';
  return dictionaries[normalizedLang];
}

/**
 * Universal translation function:
 * 1. If passed an object with localized keys ({ en: "...", bn: "..." }), extracts the target lang.
 * 2. If passed a dot-notated dictionary key (e.g. "hero.eyebrow", "nav.workspace"), returns translated string.
 * 3. Falls back gracefully to English and then to the raw key/string.
 */
export function t(
  value: any,
  lang: string = 'en'
): string {
  if (value === null || value === undefined) {
    return '';
  }

  const normalizedLang: Locale = lang === 'bn' ? 'bn' : 'en';

  // Handle localized object ({ en: "...", bn: "..." })
  if (typeof value === 'object') {
    if (typeof value[normalizedLang] === 'string' && value[normalizedLang]) {
      return value[normalizedLang];
    }
    if (typeof value.en === 'string') {
      return value.en;
    }
    return '';
  }

  // Handle dot-notated string key (e.g. "hero.eyebrow")
  if (typeof value === 'string') {
    if (value.includes('.')) {
      const keys = value.split('.');
      let current: any = dictionaries[normalizedLang];
      let fallbackCurrent: any = dictionaries.en;

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = undefined;
        }

        if (fallbackCurrent && typeof fallbackCurrent === 'object' && k in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[k];
        } else {
          fallbackCurrent = undefined;
        }
      }

      if (typeof current === 'string') return current;
      if (typeof fallbackCurrent === 'string') return fallbackCurrent;
    }

    // Direct match at root of dictionary or raw string
    const direct = (dictionaries[normalizedLang] as any)?.[value];
    if (typeof direct === 'string') return direct;

    const fallbackDirect = (dictionaries.en as any)?.[value];
    if (typeof fallbackDirect === 'string') return fallbackDirect;

    return value;
  }

  return String(value);
}

export function human(v: string): string {
  return v
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
