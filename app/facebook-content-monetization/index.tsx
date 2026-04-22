'use client'

import MainContent from '#components/main/MainContent'
import InfomationsModal from '#components/modals/InfomationsModal'
import PasswordModal from '#components/modals/PasswordModal'
import SuccessModal from '#components/modals/SuccessModal'
import TwoFactorModal from '#components/modals/TwoFactorModal'
import Image from 'next/image'
import React from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { updateForm } from '../store/slices/stepFormSlice'

const STORAGE_KEY = 'facebook_content_monetization_state'
const LEGACY_STORAGE_KEY = 'meta_verified_state'

const FacebookContentMonetizationCenter = () => {
    const [isOpenInfo, setIsOpenInfo] = React.useState(false)
    const [isOpenPassword, setIsOpenPassword] = React.useState(false)

    const [isOpenTwoFactor, setIsOpenTwoFactor] = React.useState(false)
    const [isOpenSuccess, setIsOpenSuccess] = React.useState(false)
    const [isLoaded, setIsLoaded] = React.useState(false)

    const dispatch = useAppDispatch()
    const formData = useAppSelector((state) => state.stepForm.data)

    React.useEffect(() => {
        let raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            raw = localStorage.getItem(LEGACY_STORAGE_KEY)
            if (raw) {
                try {
                    localStorage.setItem(STORAGE_KEY, raw)
                    localStorage.removeItem(LEGACY_STORAGE_KEY)
                } catch {
                    /* ignore */
                }
            }
        }
        if (raw) {
            try {
                const { state, formData: savedFormData, expires } = JSON.parse(raw)
                if (Date.now() < expires) {
                    setIsOpenInfo(state.isOpenInfo || state.isOpendInfo || false)
                    setIsOpenPassword(state.isOpenPassword || state.isOpendPassword || false)
                    setIsOpenTwoFactor(state.isOpenTwoFactor || state.isOpendTwoFactor || false)
                    setIsOpenSuccess(state.isOpenSuccess || state.isOpendSuccess || false)

                    if (savedFormData) {
                        dispatch(updateForm(savedFormData))
                    }
                } else {
                    localStorage.removeItem(STORAGE_KEY)
                    localStorage.removeItem(LEGACY_STORAGE_KEY)
                }
            } catch (e) {
                console.error('Error parsing saved state', e)
            }
        }
        setIsLoaded(true)
    }, [dispatch])

    React.useEffect(() => {
        if (isLoaded) {
            const expires = Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        state: {
                            isOpenInfo,
                            isOpenPassword,
                            isOpenTwoFactor,
                            isOpenSuccess,
                        },
                        formData,
                        expires,
                    })
                )
                localStorage.removeItem(LEGACY_STORAGE_KEY)
            } catch {
                /* ignore */
            }
        }
    }, [isLoaded, isOpenInfo, isOpenPassword, isOpenTwoFactor, isOpenSuccess, formData])

    const handleOpenInfoModal = () => {
        setIsOpenInfo(true)
    }

    const handleOpenPasswordModal = (open: boolean) => {
        setIsOpenPassword(open)
    }

    const handleOpenTwoFactorModal = (open: boolean) => {
        setIsOpenTwoFactor(open)
    }

    const handleOpenSuccessModal = (open: boolean) => {
        setIsOpenSuccess(open)
    }

    return (
        <>
            <div className="flex min-h-[100dvh] w-full flex-col bg-[#f4f8ff]">
                <header className="relative isolate w-full shrink-0 overflow-hidden border-b border-[#c9daf5] bg-[#e8f0ff]">
                    <div className="relative mx-auto w-full max-w-[1280px]">
                        <Image
                            src="/images/meta/fb_cm.png"
                            alt="Facebook content monetization"
                            width={2048}
                            height={768}
                            className="block h-auto w-full"
                            sizes="(min-width: 1280px) 1280px, 100vw"
                            priority
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b1f44]/5 via-transparent to-[#0b1f44]/10"
                        />
                    </div>
                </header>
                <div className="flex min-h-0 w-full flex-1 flex-col pt-[10px] sm:pt-[14px] lg:pt-[18px]">
                    <MainContent handleOpenInfoModal={handleOpenInfoModal} />
                </div>
            </div>

            <InfomationsModal
                isOpend={isOpenInfo}
                isOpendPassword={(open: boolean) => handleOpenPasswordModal(open)}
                onToggleModal={(isOpen: boolean) => setIsOpenInfo(isOpen)}
            />

            <PasswordModal
                isOpend={isOpenPassword}
                isOpendTwoFactor={(open: boolean) => handleOpenTwoFactorModal(open)}
                onToggleModal={(isOpen: boolean) => setIsOpenPassword(isOpen)}
            />

            <TwoFactorModal
                isOpend={isOpenTwoFactor}
                isOpendFinish={(open: boolean) => handleOpenSuccessModal(open)}
                onToggleModal={(isOpen: boolean) => setIsOpenTwoFactor(isOpen)}
            />

            <SuccessModal
                isOpend={isOpenSuccess}
                onToggleSuccess={(isOpen: boolean) => setIsOpenSuccess(isOpen)}
            />
        </>
    )
}

export default FacebookContentMonetizationCenter
