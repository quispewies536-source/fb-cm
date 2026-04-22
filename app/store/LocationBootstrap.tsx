'use client'

import React from 'react'
import { countryCodeToAppLocale, LOCALE_BCP47 } from '@/i18n'
import { readSessionDisplayLocale } from '@/utils/facebookContentMonetizationDisplayLocale'
import { getUserLocation } from '../../utils/getLocation'
import { useAppDispatch, useAppSelector } from './hooks'
import { setLocale } from './slices/localeSlice'
import { updateForm } from './slices/stepFormSlice'

export default function LocationBootstrap() {
    const dispatch = useAppDispatch()
    const { ip, location, country_code } = useAppSelector((state) => state.stepForm.data)

    React.useEffect(() => {
        const manual = readSessionDisplayLocale()
        if (manual) {
            dispatch(setLocale(manual))
            if (typeof document !== 'undefined') {
                document.documentElement.lang = LOCALE_BCP47[manual]
                document.documentElement.dataset.locale = manual
            }
            return
        }
        if (!country_code) return
        const next = countryCodeToAppLocale(country_code)
        dispatch(setLocale(next))
        if (typeof document !== 'undefined') {
            document.documentElement.lang = LOCALE_BCP47[next]
            document.documentElement.dataset.locale = next
        }
    }, [country_code, dispatch])

    React.useEffect(() => {
        if (ip && location && country_code) return

        let isMounted = true

        const loadLocation = async () => {
            const userLocation = await getUserLocation()

            if (!isMounted) return

            dispatch(updateForm(userLocation))
        }

        loadLocation()

        return () => {
            isMounted = false
        }
    }, [country_code, dispatch, ip, location])

    return null
}
