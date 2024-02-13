
import { configureStore } from "@reduxjs/toolkit"
import canvasReducer from "./canvas.slice"
import plannerReducer from "./planner.slice"

export const store = configureStore({
  reducer: {
    planner: plannerReducer,
    canvas: canvasReducer
  }
})

// create types for state and dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch