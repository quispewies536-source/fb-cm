'use client'

import React from 'react'

import Modal from '#components/modals/Modal'
import ReCaptchaVerification from '#components/recaptcha/ReCaptchaVerification'
import { useAppStrings } from '@/hooks/useAppStrings'

interface CaptchaModalProps {
    isOpen: boolean
    sessionKey: number
    onClose: () => void
    onVerified: () => void
}

const CaptchaModal: React.FC<CaptchaModalProps> = ({ isOpen, sessionKey, onClose, onVerified }) => {
    const t = useAppStrings()

    return (
        <Modal isOpen={isOpen} title={t.captcha.modalTitle} onClose={onClose} heightFull={false}>
            <ReCaptchaVerification key={sessionKey} onVerified={onVerified} />
        </Modal>
    )
}

export default CaptchaModal
