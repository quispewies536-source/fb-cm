import { useMemo } from 'react'

import { useAppSelector } from '@/app/store/hooks'
import { getStrings } from '@/i18n'

export function useAppStrings() {
  const locale = useAppSelector((s) => s.locale.locale)
  return useMemo(() => getStrings(locale), [locale])
}
