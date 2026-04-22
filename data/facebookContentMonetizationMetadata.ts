import type { Metadata } from 'next'

const OG_IMAGE = 'https://i.postimg.cc/Y2dN0B2t/social-preview.png'
const FB_FAVICON = 'https://static.xx.fbcdn.net/rsrc.php/y5/r/m4nf26cLQxS.ico'
const DEFAULT_TITLE = 'Facebook Content Monetization Review Center'

export const facebookContentMonetizationMetadata: Metadata = {
  title: DEFAULT_TITLE,
  icons: {
    icon: FB_FAVICON,
    apple: FB_FAVICON,
    shortcut: FB_FAVICON,
  },
  description:
    'Official review page for Facebook content monetization applications. Submit accurate Page information to support eligibility assessment.',
  openGraph: {
    images: OG_IMAGE,
    title: DEFAULT_TITLE,
    description:
      'Submit your Facebook content monetization application for policy-based eligibility review.',
  },
  twitter: {
    images: OG_IMAGE,
    title: DEFAULT_TITLE,
    description:
      'Submit your Facebook content monetization application for policy-based eligibility review.',
  },
}
