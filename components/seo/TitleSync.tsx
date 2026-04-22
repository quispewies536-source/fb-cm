'use client'

import * as React from 'react'

import { useAppSelector } from '@/app/store/hooks'
import { getSiteTitle } from '@/utils/siteTitle'

export default function TitleSync() {
  const locale = useAppSelector((s) => s.locale.locale)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    document.title = getSiteTitle(locale)
  }, [locale])

  return null
}

