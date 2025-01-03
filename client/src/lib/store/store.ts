import { configureStore } from '@reduxjs/toolkit'
import authReducer from "./features/user/user";

export const makeStore = () => {
  return configureStore({
    reducer: {
      // Define your reducers here

      //user Slice
      auth: authReducer,


    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']