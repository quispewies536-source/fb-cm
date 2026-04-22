import { APP_LOCALES, type AppLocale } from '@/i18n/schema'

const LEGACY_LOCAL_STORAGE_KEY = 'meta_verified_display_locale'
const LEGACY_SESSION_KEY = 'meta_verified_session_ui_locale'
const SESSION_KEY = 'facebook_content_monetization_ui_locale'

function clearLegacyLocalStorage() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function readSessionDisplayLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null
  clearLegacyLocalStorage()
  let raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) {
    raw = sessionStorage.getItem(LEGACY_SESSION_KEY)
    if (raw && (APP_LOCALES as readonly string[]).includes(raw)) {
      try {
        sessionStorage.setItem(SESSION_KEY, raw)
        sessionStorage.removeItem(LEGACY_SESSION_KEY)
      } catch {
        /* ignore */
      }
    }
  }
  if (!raw) return null
  return (APP_LOCALES as readonly string[]).includes(raw) ? (raw as AppLocale) : null
}

export function writeSessionDisplayLocale(locale: AppLocale) {
  clearLegacyLocalStorage()
  sessionStorage.setItem(SESSION_KEY, locale)
  try {
    sessionStorage.removeItem(LEGACY_SESSION_KEY)
  } catch {
    /* ignore */
  }
}
