import { fr } from './fr.js';
import { en } from './en.js';
import { es } from './es.js';
import { de } from './de.js';

export const translations = {
  fr,
  en,
  es,
  de
};

export type Language = 'fr' | 'en' | 'es' | 'de';
export type TranslationKey = keyof typeof translations.fr.auth;
export type TournamentTranslationKey = keyof typeof translations.fr.tournament;

export class I18n {
  private currentLanguage: Language = 'fr';

  setLanguage(lang: Language) {
    this.currentLanguage = lang;
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  t(key: TranslationKey | TournamentTranslationKey | string): string {
    // Try auth namespace
    if (key in translations[this.currentLanguage].auth) {
      return translations[this.currentLanguage].auth[key as TranslationKey];
    }
    // Try tournament namespace
    if (translations[this.currentLanguage].tournament && key in translations[this.currentLanguage].tournament) {
      return translations[this.currentLanguage].tournament[key as TournamentTranslationKey];
    }
    // Fallback to key itself
    return key;
  }
}

export function detectLanguageFromHeaders(headers: any): Language {
  const acceptLanguage = headers['accept-language'] || '';
  
  const languages = acceptLanguage.toLowerCase().split(',').map((lang: string) => lang.trim().split(';')[0]);
  for (const lang of languages) {
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('de')) return 'de';
    if (lang.startsWith('fr')) return 'fr';
  }
  
  return 'fr';
}

export function createI18nForRequest(headers: any): I18n {
  const i18nInstance = new I18n();
  const detectedLang = detectLanguageFromHeaders(headers);
  i18nInstance.setLanguage(detectedLang);
  return i18nInstance;
}

export const i18n = new I18n();