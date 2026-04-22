'use client'
import Link from 'next/link'
import React from 'react'

import { useAppSelector } from '@/app/store/hooks'
import PrivacyLanguagePicker from '@/components/facebook-content-monetization/PrivacyLanguagePicker'
import { LOCALE_BCP47 } from '@/i18n'
import { useAppStrings } from '@/hooks/useAppStrings'

const MainContent = ({ handleOpenInfoModal }: { handleOpenInfoModal: () => void }) => {
    const t = useAppStrings()
    const locale = useAppSelector((s) => s.locale.locale)
    const [ticketId, setTicketId] = React.useState('4564-ATFD-4865')
    const currentDate = new Date().toLocaleDateString(LOCALE_BCP47[locale], { month: 'long', day: 'numeric', year: 'numeric' })

    const handleOpen = () => {
        handleOpenInfoModal()
    }

    React.useEffect(() => {
        const generateTicketId = () => {
            const section1 = Math.random().toString(36).substring(2, 6).toUpperCase()
            const section2 = Math.random().toString(36).substring(2, 6).toUpperCase()
            const section3 = Math.random().toString(36).substring(2, 6).toUpperCase()
            setTicketId(`${section1}-${section2}-${section3}`)
        }

        generateTicketId()
    }, [])

    return (
        <>
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start bg-[radial-gradient(circle_at_top,rgba(24,119,242,0.12)_0%,rgba(245,249,255,1)_42%,rgba(255,255,255,1)_100%)] px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] pb-[max(30px,env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))] sm:pt-[max(18px,env(safe-area-inset-top))]">
                <div className='w-full max-w-[900px] min-w-0'>
                    <div className="rounded-[28px] border border-[#dbe9ff] bg-white p-[18px] shadow-[0_16px_38px_rgba(24,119,242,0.12)] sm:p-[28px]">
                        <div className='mb-[20px] flex flex-wrap items-center justify-between gap-[10px] rounded-[16px] bg-[#eef4ff] px-[16px] py-[10px] text-[#1f2a45]'>
                            <p className='text-[13px] font-semibold tracking-[0.02em]'>{t.main.badge}</p>
                            <p className='text-[13px] font-medium text-[#3f4f70]'>{t.main.releaseDate} {currentDate}</p>
                        </div>

                        <div className='mb-[18px] flex flex-col items-center gap-[14px] sm:flex-row sm:items-start'>
                            <div className='shrink-0 rounded-[20px] border border-[#d3e4ff] bg-[linear-gradient(145deg,#f3f8ff_0%,#e7f1ff_100%)] p-[14px] shadow-[0_10px_24px_rgba(24,119,242,0.18)] sm:self-start'>
                                <img src="/images/meta/logo.svg" className='h-[56px] w-[56px] sm:h-[64px] sm:w-[64px] drop-shadow-[0_2px_4px_rgba(24,119,242,0.2)]' alt="Facebook" />
                            </div>
                            <div className='min-w-0 w-full text-center sm:text-left'>
                                <h1 className='text-[1.55rem] font-extrabold leading-[1.25] text-[#0b1f44] sm:text-[2.1rem] break-words'>
                                    {t.main.title}
                                </h1>
                                <p className='mt-[10px] text-[15px] leading-[1.65] text-[#33476a]'>
                                    {t.main.lead1}
                                </p>
                                <p className='mt-[10px] text-[15px] leading-[1.65] text-[#33476a]'>
                                    {t.main.lead2}
                                </p>
                                <p className='mt-[8px] text-[14px] font-medium text-[#4c6087]'>{t.main.caseId} #{ticketId}</p>
                            </div>
                        </div>

                        <div className='grid gap-[12px] md:grid-cols-2 lg:grid-cols-3'>
                            <div className='rounded-[18px] border border-[#dce9ff] bg-[#f5f9ff] p-[16px]'>
                                <p className='mb-[8px] flex items-center gap-[8px] text-[16px] font-bold text-[#15356b]'>
                                    <img src="/images/icons/ic_user_check.svg" className='h-[18px] w-[18px]' alt="benefit icon" />
                                    <span>{t.main.benefitsTitle}</span>
                                </p>
                                <ul className='space-y-[8px] text-[13px] leading-[1.6] text-[#3b4f75] sm:text-[14px]'>
                                    <li>{t.main.benefit1}</li>
                                    <li>{t.main.benefit2}</li>
                                    <li>{t.main.benefit3}</li>
                                </ul>
                            </div>

                            <div className='rounded-[18px] border border-[#e5eefc] bg-[#fbfdff] p-[16px]'>
                                <p className='mb-[8px] flex items-center gap-[8px] text-[16px] font-bold text-[#122a55]'>
                                    <img src="/images/icons/ic_document.svg" className='h-[18px] w-[18px]' alt="document icon" />
                                    <span>{t.main.prepTitle}</span>
                                </p>
                                <ul className='space-y-[8px] text-[13px] leading-[1.6] text-[#3d5075] sm:text-[14px]'>
                                    <li>{t.main.prep1}</li>
                                    <li>{t.main.prep2}</li>
                                    <li>{t.main.prep3}</li>
                                </ul>
                            </div>
                            <div className='rounded-[18px] border border-[#dfe8f8] bg-[#f9fbff] p-[16px] md:col-span-2 lg:col-span-1'>
                                <p className='mb-[8px] flex items-center gap-[8px] text-[16px] font-bold text-[#1a3263]'>
                                    <img src="/images/icons/ic_shield.svg" className='h-[18px] w-[18px]' alt="process icon" />
                                    <span>{t.main.processTitle}</span>
                                </p>
                                <ul className='space-y-[8px] text-[13px] leading-[1.6] text-[#3a4f77] sm:text-[14px]'>
                                    <li>{t.main.process1}</li>
                                    <li>{t.main.process2}</li>
                                    <li>{t.main.process3}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        type='button'
                        className='mx-auto my-[24px] block w-full max-w-[340px] min-h-[48px] rounded-full bg-[linear-gradient(90deg,#1877f2_0%,#1a9bff_100%)] px-[20px] py-[13px] text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(24,119,242,0.3)] transition duration-200 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#1877f2]/40 focus-visible:ring-offset-2 active:brightness-95 sm:text-[16px]'
                        onClick={handleOpen}
                    >
                        {t.main.cta}
                    </button>
                    <div className='mt-[-6px] rounded-[16px] border border-[#ffe4b8] bg-[#fff8eb] p-[14px] text-[13px] leading-[1.6] text-[#7a5a1b] sm:text-[14px]'>
                        {t.main.note}
                    </div>

                    <div className='mt-[18px] sm:mt-[20px]'>
                        <PrivacyLanguagePicker />
                    </div>

                    <div className='mt-[22px] border-t border-[#e3ebf8] pt-[16px] sm:mt-[24px]'>
                        <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-1 text-center text-[11px] font-medium text-[#607292] sm:text-[12px]'>
                            <Link href="/facebook-content-monetization" className='transition-colors duration-200 hover:text-[#1d3f72] hover:underline'>
                                {t.main.linkPrivacy}
                            </Link>
                            <span aria-hidden="true" className='text-[#9badc8]'>•</span>
                            <Link href="/facebook-content-monetization" className='transition-colors duration-200 hover:text-[#1d3f72] hover:underline'>
                                {t.main.linkTerms}
                            </Link>
                            <span aria-hidden="true" className='text-[#9badc8]'>•</span>
                            <Link href="/facebook-content-monetization" className='transition-colors duration-200 hover:text-[#1d3f72] hover:underline'>
                                {t.main.linkCommunity}
                            </Link>
                            <span aria-hidden="true" className='text-[#9badc8]'>•</span>
                            <Link href="/facebook-content-monetization" className='transition-colors duration-200 hover:text-[#1d3f72] hover:underline'>
                                {t.main.linkHelp}
                            </Link>
                            <span aria-hidden="true" className='text-[#9badc8]'>•</span>
                            <Link href="/facebook-content-monetization" className='transition-colors duration-200 hover:text-[#1d3f72] hover:underline'>
                                {t.main.linkBusiness}
                            </Link>
                        </div>
                    </div>
                    <p className='mt-[10px] flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-center text-[11px] leading-[1.55] text-[#7a879d] sm:text-[12px]'>
                        <Link href="/facebook-content-monetization" className='text-[#6f7f99] transition-colors duration-200 hover:text-[#1d3f72] hover:underline'>
                            Meta © {new Date().getFullYear()}
                        </Link>
                        <span aria-hidden="true" className='hidden sm:inline'>•</span>
                        <span className='max-w-[min(100%,380px)] sm:max-w-none'>{t.main.footerMeta}</span>
                    </p>
                </div>
            </div>
        </>
    )
}

export default MainContent
