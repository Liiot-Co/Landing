import es from "./locales/es.json";

export const defaultLocale = "es" as const;
export const locales = ["es"] as const;

export type Locale = (typeof locales)[number];
export type Translations = typeof es;

export const translations: Record<Locale, Translations> = {
  es,
};

/**
 * Returns translation dictionary for given locale.
 * Falls back to defaultLocale if not found.
 */
export function getTranslations(locale: Locale = defaultLocale): Translations {
  return translations[locale] ?? translations[defaultLocale];
}

/**
 * Default translations shortcut for current single-locale stage.
 * When full i18n routing is implemented in the future, components can switch to
 * `getTranslations(currentLocale)`.
 */
export const t = getTranslations(defaultLocale);
