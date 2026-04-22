import type { AppLocale } from './schema'

/** Tên hiển thị gốc cho từng locale (dùng trong select) */
export const LOCALE_OPTION_LABELS: Record<AppLocale, string> = {
  en: 'English',
  ar: 'العربية',
  vi: 'Tiếng Việt',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  th: 'ไทย',
  id: 'Bahasa Indonesia',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
}
