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
            const { id, notes} = action.payload;
            const sessions = {...state.config.sessions};
            if (sessions.hasOwnProperty(id)){
              sessions[id].notes = notes;
            } else {
              sessions[id] = {notes}
            }
            state.config.sessions = sessions;
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