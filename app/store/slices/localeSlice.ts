import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AppLocale } from '@/i18n/schema'

const initialState: { locale: AppLocale } = {
  locale: 'en',
}

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<AppLocale>) {
      state.locale = action.payload
    },
  },
})

export const { setLocale } = localeSlice.actions
export default localeSlice.reducer
