import type { AppLocale, AppStrings } from './schema'
import { ar } from './locales/ar'
import { de } from './locales/de'
import { en } from './locales/en'
import { es } from './locales/es'
import { fr } from './locales/fr'
import { id } from './locales/id'
import { ja } from './locales/ja'
import { ko } from './locales/ko'
import { pt } from './locales/pt'
import { th } from './locales/th'
import { vi } from './locales/vi'
import { zhHans } from './locales/zh-Hans'
import { zhHant } from './locales/zh-Hant'

export type { AppLocale, AppStrings } from './schema'
export { APP_LOCALES, LOCALE_BCP47 } from './schema'
export { countryCodeToAppLocale } from './countryToLocale'

const MESSAGES: Record<AppLocale, AppStrings> = {
  en,
  ar,
  vi,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ja,
  ko,
  th,
  id,
  es,
  pt,
  fr,
  de,
}

export function getStrings(locale: AppLocale): AppStrings {
  return MESSAGES[locale] ?? MESSAGES.en
}
