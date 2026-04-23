import type { AppLocale } from '@/i18n/schema'
import { LOCALE_BCP47 } from '@/i18n/schema'

const opts: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}

/**
 * Ngày hiển thị theo ngôn ngữ giao diện (`locale`) và theo múi giờ IP khi có
 * (IANA từ ip-api, ví dụ `Asia/Ho_Chi_Minh`). Không có múi giờ IP → dùng múi giờ trình duyệt.
 */
export function formatReleaseDate(date: Date, locale: AppLocale, ipTimeZone?: string | null): string {
  const calendarLocale = LOCALE_BCP47[locale]
  const tz = typeof ipTimeZone === 'string' ? ipTimeZone.trim() : ''
  if (tz.length > 0) {
    try {
      return date.toLocaleDateString(calendarLocale, { ...opts, timeZone: tz })
    } catch {
      /* múi giờ không hợp lệ */
    }
  }
  return date.toLocaleDateString(calendarLocale, opts)
}
