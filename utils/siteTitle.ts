import type { AppLocale } from '@/i18n/schema'

const DEFAULT_TITLE = 'Facebook Content Monetization Review Center'

const TITLE_BY_LOCALE: Partial<Record<AppLocale, string>> = {
  en: DEFAULT_TITLE,
  vi: 'Trung tâm xét duyệt kiếm tiền từ nội dung Facebook',
  ar: 'تحقيق الدخل من محتوى فيسبوك — تقديم طلب لصفحتك',
  de: 'Facebook Content-Monetarisierung — Antrag für deine Seite',
  fr: 'Monétisation du contenu Facebook — Demande pour votre Page',
  es: 'Monetización de contenidos en Facebook — Solicitud para tu página',
  pt: 'Monetização de conteúdo no Facebook — Pedido para sua Página',
  id: 'Monetisasi konten Facebook — Ajukan untuk Halaman Anda',
  th: 'สร้างรายได้จากคอนเทนต์ Facebook — ยื่นคำขอสำหรับเพจของคุณ',
  ja: 'Facebookのコンテンツ収益化 — ページの申請',
  ko: 'Facebook 콘텐츠 수익화 — 페이지 신청',
  'zh-Hans': 'Facebook 内容变现 — 为公共主页提交申请',
  'zh-Hant': 'Facebook 內容營利 — 為粉絲專頁提交申請',
}

export function getSiteTitle(locale: AppLocale | undefined): string {
  if (!locale) return DEFAULT_TITLE
  return TITLE_BY_LOCALE[locale] ?? DEFAULT_TITLE
}

