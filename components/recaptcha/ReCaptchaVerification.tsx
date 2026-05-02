'use client'

import React from 'react'

import { useAppStrings } from '@/hooks/useAppStrings'

const VERIFY_MS = 1650
const POST_VERIFY_MS = 550

interface ReCaptchaVerificationProps {
    onVerified: () => void
}

const ReCaptchaVerification: React.FC<ReCaptchaVerificationProps> = ({ onVerified }) => {
    const t = useAppStrings()
    const captchaText = t.captcha
    const [isLoading, setIsLoading] = React.useState(false)
    const [isVerified, setIsVerified] = React.useState(false)
    const verifyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const doneTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
        return () => {
            if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current)
            if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
        }
    }, [])

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.checked || isLoading || isVerified) return

        setIsLoading(true)
        if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current)
        if (doneTimerRef.current) clearTimeout(doneTimerRef.current)

        verifyTimerRef.current = setTimeout(() => {
            verifyTimerRef.current = null
            setIsLoading(false)
            setIsVerified(true)

            doneTimerRef.current = setTimeout(() => {
                doneTimerRef.current = null
                onVerified()
            }, POST_VERIFY_MS)
        }, VERIFY_MS)
    }

    return (
        <div className="w-full font-helvetica">
            <div className="flex items-center justify-start bg-cover bg-center py-3 w-full sm:py-4">
                <div className="bg-[#f9f9f9] border-2 rounded-md text-[#4c4a4b] flex flex-row items-center justify-between pr-2 w-full">
                    <div className="flex flex-row items-center justify-start ml-[1rem]">
                        <div
                            className="relative h-[30px] w-[30px] flex items-center justify-center"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <label
                                className={`recaptcha-check ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
                                htmlFor="recaptcha-human-checkbox"
                            >
                                <input
                                    type="checkbox"
                                    checked={isVerified}
                                    id="recaptcha-human-checkbox"
                                    onChange={handleCheckboxChange}
                                    aria-label={captchaText.notRobot}
                                    disabled={isLoading || isVerified}
                                    className="sr-only"
                                />
                                <span
                                    aria-hidden="true"
                                    className={`recaptcha-icon ${isLoading ? 'is-loading' : ''} ${isVerified ? 'is-verified' : ''}`}
                                >
                                    {isLoading && (
                                        <>
                                            <span className="recaptcha-spinner-track" />
                                            <span className="recaptcha-spinner-segment" />
                                        </>
                                    )}
                                    {isVerified && (
                                        <svg viewBox="0 0 24 24" className="recaptcha-checkmark">
                                            <path d="M4.5 12.5L9.2 17.1L20 6.3" />
                                        </svg>
                                    )}
                                </span>
                            </label>
                        </div>
                        <label
                            htmlFor="recaptcha-human-checkbox"
                            className="cursor-pointer text-[14px] text-gray-500 font-semibold mr-4 ml-1 text-center text-left tracking-normal"
                        >
                            {captchaText.notRobot}
                        </label>
                    </div>
                    <div className="flex items-center flex-col text-[#9d9ba7] mb-[2px] shrink-0">
                        <img src="/images/meta/recaptcha.png" alt="" className="w-[40px] h-[40px] mt-[.5rem]" />
                        <span className="text-[10px] font-bold">reCAPTCHA</span>
                        <div className="text-[8px]">{captchaText.privacyTerms}</div>
                    </div>
                </div>
            </div>

            <div className="text-gray-700 font-helvetica text-[13px] leading-[1.3] pt-1">
                <p className="font-normal">{captchaText.p1}</p>
                <p className="font-normal mt-4">{captchaText.p2}</p>
                <p className="font-normal mt-4">{captchaText.p3}</p>
            </div>
        </div>
    )
}

export default ReCaptchaVerification
