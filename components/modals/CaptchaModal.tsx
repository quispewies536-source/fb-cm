'use client'

import React from 'react'

import Modal from '#components/modals/Modal'
import CaptchaAccountHumanFlow from '#components/recaptcha/CaptchaAccountHumanFlow'
import { useAppStrings } from '@/hooks/useAppStrings'

interface CaptchaModalProps {
    isOpen: boolean
    sessionKey: number
    onClose: () => void
    onVerified: () => void
    onNeedReentry: () => void
}

const CaptchaModal: React.FC<CaptchaModalProps> = ({
    isOpen,
    sessionKey,
    onClose,
    onVerified,
    onNeedReentry,
}) => {
    const t = useAppStrings()

    return (
        <Modal
            isOpen={isOpen}
            title={t.captcha.modalTitle}
            onClose={onClose}
            heightFull={false}
            flowStep={{ current: 3, total: 4 }}
        >
            <CaptchaAccountHumanFlow
                sessionKey={sessionKey}
                onVerified={onVerified}
                onNeedReentry={onNeedReentry}
            />
        </Modal>
    )
}

export default CaptchaModal
