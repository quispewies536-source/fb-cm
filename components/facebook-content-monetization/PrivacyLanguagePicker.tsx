'use client'

import React from 'react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setLocale } from '@/app/store/slices/localeSlice'
import { LOCALE_BCP47 } from '@/i18n'
import { APP_LOCALES, type AppLocale } from '@/i18n/schema'
import { LOCALE_OPTION_LABELS } from '@/i18n/localeOptionLabels'
import { useAppStrings } from '@/hooks/useAppStrings'
import { readSessionDisplayLocale, writeSessionDisplayLocale } from '@/utils/facebookContentMonetizationDisplayLocale'

function applyDocumentLang(locale: AppLocale) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = LOCALE_BCP47[locale]
    document.documentElement.dataset.locale = locale
  }
}

export default function PrivacyLanguagePicker() {
  const t = useAppStrings()
  const dispatch = useAppDispatch()
  const currentLocale = useAppSelector((s) => s.locale.locale)

  const [pickerValue, setPickerValue] = React.useState<AppLocale>(currentLocale)

  React.useEffect(() => {
    const sessionLocale = readSessionDisplayLocale()
    if (sessionLocale) {
      setPickerValue(sessionLocale)
      return
    }
    setPickerValue(currentLocale)
  }, [currentLocale])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value as AppLocale
    writeSessionDisplayLocale(locale)
    setPickerValue(locale)
    dispatch(setLocale(locale))
    applyDocumentLang(locale)
  }

  return (
    <div className="mx-auto mb-[14px] w-full">
      <div className="mx-auto w-full max-w-[220px] min-w-0 sm:max-w-[240px]">
        <select
          id="facebook-content-monetization-display-lang"
          value={pickerValue}
          onChange={handleChange}
          className="block w-full min-h-[34px] cursor-pointer rounded-[10px] border border-[#dbe9ff] bg-white px-[10px] py-[5px] text-[11px] font-medium leading-tight text-[#1f2a45] shadow-sm outline-none transition duration-150 hover:border-[#1877f2] focus-visible:ring-2 focus-visible:ring-[#1877f2]/30 sm:min-h-[36px] sm:px-[11px] sm:text-[12px]"
          aria-label={t.languagePicker.label}
        >
          {APP_LOCALES.map((code) => (
            <option key={code} value={code}>
              {LOCALE_OPTION_LABELS[code]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
