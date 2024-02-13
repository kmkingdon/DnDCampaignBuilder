import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import {RootState} from "./store"

type sessionInfo = {
    notes: string;
}
interface SessionMap { [key: string]: sessionInfo; }
interface PlannerState {
  config: {
    sessions: SessionMap
  }
}

const initialState: PlannerState = {
  config: {
    sessions: {}
  }
}

export const plannerSlice = createSlice({
    reducers: {
        updateSession: (state, action: PayloadAction<{id:string, notes:string }>) => {
            console.log({payload: action.payload})
        },
    },
    name: "planner",
    initialState
})

// actions
export const {updateSession} = plannerSlice.actions 

// selectors
export const selectSessions = (state: RootState) => state.planner.config.sessions;

export default plannerSlice.reducer