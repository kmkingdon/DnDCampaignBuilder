
import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from '@reduxjs/toolkit/query'

import canvasReducer from "./canvas.slice"
import configReducer from "./config.slice"
import { dndApi } from './api.dnd'

export const store = configureStore({
  reducer: {
    config: configReducer,
    canvas: canvasReducer,
    [dndApi.reducerPath]: dndApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dndApi.middleware),
})

setupListeners(store.dispatch)

// create types for state and dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch