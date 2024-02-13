import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import {RootState} from "./store"
import { DiagramData } from "@/app/components/canvas/CanvasWrapper";


interface CanvasState {
  config: DiagramData;
}

const initialState: CanvasState = {
  config: {
        nodeDataArray: [],
        linkDataArray: [],
        modelData: {
        canRelink: true
        },
        selectedData: null,
        skipsDiagramUpdate: false
    },
}

export const canvasSlice = createSlice({
    reducers: {
        updateDiagramConfig: (state, action: PayloadAction<DiagramData>) => {
            state.config = action.payload;
        }
    },
    name: "canvas",
    initialState
})

// actions
export const {updateDiagramConfig} = canvasSlice.actions 

// selectors
export const selectDiagramDataConfig = (state: RootState) => state.canvas.config;
export const selectSelected = (state: RootState) => state.canvas.config.selectedData;

export default canvasSlice.reducer