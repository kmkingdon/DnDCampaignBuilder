import { useAppDispatch, useAppSelector } from "@/state/hook";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import debounce  from "lodash/debounce"

import { updateSession } from '@/state/planner.slice';
import { selectSelected } from "@/state/canvas.slice";
import diagramInstance from "./canvas/CanvasDiagram";


export default function Planner() {
    const dispatch = useAppDispatch();
    const diagram = diagramInstance.getDiagramRef();
    const selectedData = useAppSelector(selectSelected);

    if(selectedData === null){
      return null;
    } else {

      const {key, text } = selectedData;

      
      const  [name, setName] = useState<string>(() => text)
      const handleNameChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
        setName(e.target.value);
      }

      useEffect(() => {
        console.log({name})
      }, [name])

      const  [notes, setNotes] = useState<string>('')
      const handleNotesChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
      }
      useEffect(() => {
        console.log(notes)
        dispatch(updateSession({id:key, notes}))
      }, [notes])

      return (
        <div className="w-full h-full dark:bg-slate-700">
          <div className="w-full p-4">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Session Name</label>
            <input value={name} onChange={(e) => handleNameChange(e)} type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div>
          <div className="w-full p-4">
            <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notes</label>
            <textarea value={notes} onChange={(e) => handleNotesChange(e)} rows={8} id="notes" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div>
        </div>
      );
    }
  }