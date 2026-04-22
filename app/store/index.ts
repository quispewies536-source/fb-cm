import { configureStore } from "@reduxjs/toolkit"
import localeReducer from "./slices/localeSlice"
import stepFormReducer from "./slices/stepFormSlice"

export const store = configureStore({
    reducer: {
        stepForm: stepFormReducer,
        locale: localeReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch