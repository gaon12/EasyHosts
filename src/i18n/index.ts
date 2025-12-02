import { en, TranslationKeys } from './languages/en';
import { ko } from './languages/ko';

export type Language = 'en' | 'ko';

export const languages = {
  en,
  ko,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  ko: '한국어',
};

// Get nested translation by dot notation key
export function getTranslation(
  translations: TranslationKeys,
  key: string
): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

// Replace placeholders in translation strings
export function interpolate(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() ?? match;
  });
}

// Get default language from browser or system
export function getDefaultLanguage(): Language {
  // Check localStorage first
  const saved = localStorage.getItem('language') as Language;
  if (saved && (saved === 'en' || saved === 'ko')) {
    return saved;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ko')) {
    return 'ko';
  }

  return 'en';
}

// Save language preference
export function saveLanguage(lang: Language): void {
  localStorage.setItem('language', lang);
}
