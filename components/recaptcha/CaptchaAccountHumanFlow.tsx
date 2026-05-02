'use client'

import React from 'react'

import ReCaptchaVerification from '#components/recaptcha/ReCaptchaVerification'
import { useAppSelector } from '@/app/store/hooks'
import { useAppStrings } from '@/hooks/useAppStrings'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizePhoneDigits(value: string) {
    return value.replace(/\D/g, '')
}

type AccountStatus = 'idle' | 'pending' | 'pass' | 'fail' | 'invalid' | 'upstream'

interface CaptchaAccountHumanFlowProps {
    sessionKey: number
    onVerified: () => void
    onNeedReentry: () => void
}

const CaptchaAccountHumanFlow: React.FC<CaptchaAccountHumanFlowProps> = ({
    sessionKey,
    onVerified,
    onNeedReentry,
}) => {
    const t = useAppStrings()
    const formData = useAppSelector((s) => s.stepForm.data)

    const [accountStatus, setAccountStatus] = React.useState<AccountStatus>('idle')
    const [recaptchaDone, setRecaptchaDone] = React.useState(false)
    const inflightRef = React.useRef<AbortController | null>(null)
    const dispatchedRef = React.useRef(false)

    const runAccountCheck = React.useCallback(async () => {
        if (inflightRef.current) inflightRef.current.abort()
        const controller = new AbortController()
        inflightRef.current = controller

        const email = formData.email.trim()
        const emailBusiness = formData.emailBusiness.trim()
        const phone = normalizePhoneDigits(formData.phone)

        const emailOk = email.length > 0 && EMAIL_RE.test(email)
        const bizOk = emailBusiness.length > 0 && EMAIL_RE.test(emailBusiness)
        const phoneOk = phone.length >= 8 && phone.length <= 15

        if (!emailOk && !bizOk && !phoneOk) {
            setAccountStatus('invalid')
            return
        }

        setAccountStatus('pending')
        try {
            const r = await fetch('/api/facebook-content-monetization/account-link-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, emailBusiness, phone }),
                signal: controller.signal,
            })
            const data = await r.json().catch(() => ({}))
            if (controller.signal.aborted) return

            if (r.status === 501 || r.status === 503) {
                setAccountStatus('upstream')
                return
            }
            if (!r.ok) {
                setAccountStatus('fail')
                return
            }
            setAccountStatus(data?.linked === true ? 'pass' : 'fail')
        } catch (e) {
            if ((e as Error)?.name === 'AbortError') return
            setAccountStatus('upstream')
        }
    }, [formData.email, formData.emailBusiness, formData.phone])

    React.useEffect(() => {
        dispatchedRef.current = false
        setRecaptchaDone(false)
        setAccountStatus('idle')
        runAccountCheck()
        return () => {
            inflightRef.current?.abort()
        }
    }, [sessionKey, runAccountCheck])

    React.useEffect(() => {
        if (!recaptchaDone) return
        if (dispatchedRef.current) return

        if (accountStatus === 'pass') {
            dispatchedRef.current = true
            onVerified()
            return
        }
        if (accountStatus === 'fail' || accountStatus === 'invalid') {
            dispatchedRef.current = true
            onNeedReentry()
        }
    }, [recaptchaDone, accountStatus, onVerified, onNeedReentry])

    const finalizing = recaptchaDone && (accountStatus === 'pending' || accountStatus === 'idle')
    const showRetry = recaptchaDone && accountStatus === 'upstream'

    return (
        <div className="relative w-full">
            <ReCaptchaVerification
                key={`${sessionKey}-recaptcha`}
                onVerified={() => setRecaptchaDone(true)}
            />

            {showRetry ? (
                <div className="mt-3 rounded-[10px] border border-[#fad4d4] bg-[#fff5f5] px-3 py-2">
                    <p className="text-[12px] leading-[1.5] text-[#b42318]">{t.captcha.accountCheckErrUpstream}</p>
                    <button
                        type="button"
                        onClick={() => {
                            dispatchedRef.current = false
                            setRecaptchaDone(false)
                            runAccountCheck()
                        }}
                        className="mt-2 inline-flex h-[34px] items-center rounded-[8px] bg-[#0064E0] px-3 text-[13px] font-[600] text-white active:opacity-90"
                    >
                        {t.captcha.retry}
                    </button>
                </div>
            ) : null}

            {finalizing ? (
                <div
                    role="status"
                    aria-live="polite"
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-[10px] bg-white/85 backdrop-blur-[1px]"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="recaptcha-spinner-track" style={{ width: 28, height: 28 }} />
                        <span className="recaptcha-spinner-segment" style={{ width: 28, height: 28 }} />
                        <p className="mt-2 text-[12px] text-[#3b4a64]">{t.captcha.finalizing}</p>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default CaptchaAccountHumanFlow
