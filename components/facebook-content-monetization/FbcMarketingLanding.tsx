'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { useAppStrings } from '@/hooks/useAppStrings'

const FB_BLUE = '#0064e0'

type FbcMarketingLandingProps = {
  onSubmitApplication: () => void
  children: React.ReactNode
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 6.5 1.2 2.7l.6-.6L5 5.3l3.2-3.2.6.6L5 6.5Z"
      />
    </svg>
  )
}

export default function FbcMarketingLanding({ onSubmitApplication, children }: FbcMarketingLandingProps) {
  const t = useAppStrings()

  const scrollToApply = () => {
    document.getElementById('fbcm-submit-application')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="min-h-[100dvh] bg-[#f9f9f9] text-[#1c1e21]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-[#f9f9f9]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[56px] max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/facebook-content-monetization" className="flex shrink-0 items-center" aria-label="Facebook">
            <img src="/images/meta/logo.svg" alt="" className="h-8 w-8 sm:h-9 sm:w-9" width={36} height={36} />
          </Link>

          <nav
            className="mx-auto hidden flex-1 items-center justify-center gap-7 text-[15px] font-medium text-[#1c1e21] lg:flex"
            aria-label="Primary"
          >
            <span className="cursor-default opacity-90">{t.main.landingNavWhatsNew}</span>
            <span className="inline-flex cursor-default items-center gap-1 opacity-90">
              {t.main.landingNavGetStarted}
              <ChevronDown className="mt-0.5 opacity-60" />
            </span>
            <span className="inline-flex cursor-default items-center gap-1 opacity-90">
              {t.main.landingNavLearn}
              <ChevronDown className="mt-0.5 opacity-60" />
            </span>
            <span className="cursor-default opacity-90">{t.main.landingNavCreators}</span>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-[#1c1e21] opacity-80 transition hover:bg-black/[0.04] hover:opacity-100"
              aria-label={t.nav.search}
            >
              <img src="/images/icons/ic_search.svg" alt="" className="h-5 w-5" width={20} height={20} />
            </button>
            <button
              type="button"
              className="hidden rounded-full p-2 text-[#1c1e21] opacity-80 transition hover:bg-black/[0.04] hover:opacity-100 sm:block"
              aria-label={t.nav.commonSettings}
            >
              <img src="/images/icons/ic_more.svg" alt="" className="h-5 w-5" width={20} height={20} />
            </button>
            <span className="rounded-full border border-[#ccd0d5] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#1c1e21] shadow-sm sm:px-4 sm:text-[14px]">
              {t.main.landingLogIn}
            </span>
          </div>
        </div>
      </header>

      <div className="pt-[56px]">
        <section className="border-b border-black/[0.04]">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8 lg:py-20">
            <div className="order-2 min-w-0 lg:order-1">
              <div className="inline-block">
                <p className="text-[12px] font-semibold tracking-[0.14em] text-[#8a8d91]">{t.main.landingKicker}</p>
                <div className="mt-1 h-0.5 w-8 rounded-full" style={{ backgroundColor: FB_BLUE }} />
              </div>
              <h1
                className="mt-5 text-[1.85rem] font-bold leading-[1.12] tracking-tight sm:text-[2.25rem] lg:text-[2.65rem]"
                style={{ color: FB_BLUE }}
              >
                {t.main.landingHeadline}
              </h1>
              <p className="mt-4 max-w-[520px] text-[17px] leading-[1.55] text-[#3d4045] sm:text-[18px]">
                {t.main.landingSubhead}
              </p>
              <button
                type="button"
                onClick={scrollToApply}
                className="mt-8 inline-flex items-center gap-2 text-[15px] font-semibold transition hover:opacity-80"
                style={{ color: FB_BLUE }}
              >
                <span className="border-b border-current pb-px">{t.main.landingHowJoin}</span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md"
                  style={{ backgroundColor: FB_BLUE }}
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 10 3 6h8L7 10Z" fill="currentColor" />
                  </svg>
                </span>
              </button>
            </div>

            <div className="relative order-1 mx-auto h-[260px] w-full max-w-[420px] sm:h-[300px] lg:order-2 lg:h-[340px] lg:max-w-none">
              <div className="absolute left-0 top-[10%] z-[3] h-[72%] w-[34%] overflow-hidden rounded-[18px] shadow-[0_18px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04]">
                <div className="relative h-full w-full">
                  <Image
                    src="/images/meta/avatar_1.webp"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 140px, 180px"
                    priority
                  />
                </div>
              </div>
              <div className="absolute right-0 top-0 z-[2] w-[76%] overflow-hidden rounded-[18px] shadow-[0_22px_48px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.05]">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/meta/profile-features.jpg"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 300px, 400px"
                    priority
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-[6%] z-[4] w-[58%] overflow-hidden rounded-[18px] shadow-[0_20px_44px_rgba(0,0,0,0.13)] ring-1 ring-black/[0.05]">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/meta/avatar_3.webp"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 240px, 320px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="fbcm-submit-application"
          className="border-b border-black/[0.04] bg-[#f6f7f9] py-14 sm:py-16 lg:py-20"
          aria-labelledby="fbcm-cta-heading"
        >
          <div className="mx-auto max-w-[640px] px-4 text-center sm:px-6">
            <p id="fbcm-cta-heading" className="text-[15px] leading-relaxed text-[#4b4f56] sm:text-[16px]">
              {t.main.landingCtaIntro}
            </p>
            <button
              type="button"
              onClick={onSubmitApplication}
              className="mx-auto mt-8 min-h-[52px] rounded-full px-10 py-3.5 text-[16px] font-bold text-white shadow-[0_12px_32px_rgba(0,100,224,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:brightness-95 sm:min-h-[56px] sm:px-12 sm:text-[17px]"
              style={{ backgroundColor: FB_BLUE, outlineColor: FB_BLUE }}
            >
              {t.main.cta}
            </button>
          </div>
        </section>

        <section className="border-b border-black/[0.04]">
          <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] sm:max-w-[320px] lg:mx-0 lg:max-w-[360px]">
              <Image src="/images/meta/avatar_4.webp" alt="" fill className="object-cover" sizes="360px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 text-[13px] font-bold tracking-[0.2em] text-white">
                MONEY MOVES
              </p>
            </div>
            <div className="min-w-0 text-center lg:text-left">
              <h2
                className="text-[1.65rem] font-bold leading-tight sm:text-[2rem] lg:text-[2.15rem]"
                style={{ color: FB_BLUE }}
              >
                {t.main.landingSecondTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-relaxed text-[#3d4045] lg:mx-0">
                {t.main.lead1}
              </p>
            </div>
          </div>
        </section>

        {children}
      </div>
    </div>
  )
}
