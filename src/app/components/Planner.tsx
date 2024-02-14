import { useAppDispatch, useAppSelector } from "@/state/hook";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import debounce  from "lodash/debounce"
import { ColorResult, SketchPicker } from 'react-color';
import { Dropdown } from 'flowbite-react';

import { selectSessions, updateSession } from '@/state/planner.slice';
import { selectSelected } from "@/state/canvas.slice";
import diagramInstance from "./canvas/CanvasDiagram";
import { isEqual } from "lodash";


export default function Planner() {
    const dispatch = useAppDispatch();
    const selectedData = useAppSelector(selectSelected);
    const sessionData = useAppSelector(selectSessions);
    console.log({selectedData})

    if(selectedData === null){
      return null;
    } else {

      const {key, text, color } = selectedData;
      const diagram = diagramInstance.getDiagramRef();

      const  [name, setName] = useState<string>(text)

      // name logic
      const debouncedNameChange= useMemo(
        () => debounce((name) => setName(name), 100), []
      );
      const handleNameChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        debouncedNameChange(value)
      }

      //update name if selectedData changes
      useEffect(() => {
        if(!isEqual(name, text)){
          setName(text);
        }
      }, [text])

      //update node text if name changes
      useEffect(() => {
        const node = diagram?.findNodeForKey(key);
        if(node){
          diagram?.model.commit(m => {  // m == the Model
            m.set(node?.data, "text", name);
          }, "change node name");
        }
      }, [name])

      // color logic
      const [sessionColor, setSessionColor ] = useState<string>(color)
      const handleColorChange = (color:ColorResult) => {
        setSessionColor(color.hex);
        const node = diagram?.findNodeForKey(key);
        if(node){
          diagram?.model.commit(m => {  // m == the Model
            m.set(node?.data, "color", color.hex);
          }, "change node color");
        }
      }



      // notes logic
      const notesFromSession = sessionData[key] ? sessionData[key].notes : '';
      const  [notes, setNotes] = useState<string>(notesFromSession)
      const debouncedNotesChange= useMemo(
        () => debounce((notes) => setNotes(notes), 100), []
      );
      const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const notes = e.target.value;
        debouncedNotesChange(notes);
      }

      useEffect(() => {
        dispatch(updateSession({id:key, notes}))
      }, [notes])

      return (
        <div className="w-full h-full dark:bg-slate-700">
          <div className="w-full p-2">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Session Name</label>
            <input value={name} onChange={(e) => handleNameChange(e)} type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div>
          <div className="w-full p-2 flex flex-row justify-around">
            <Dropdown label="Color" dismissOnClick={false} theme={{ floating: { target: "w-[75%]" } }}> 
              <SketchPicker
                color={ sessionColor }
                onChangeComplete={(color:ColorResult) => handleColorChange(color) }
              />
            </Dropdown>
            {/* @ts-ignore */}
            <div className="w-10 h-10" x-data="{ dynamicColor: {{ $sessionColor }} }" style={{ backgroundColor: sessionColor }}>

            </div>
          </div>
          <div className="w-full p-2">
            <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notes</label>
            <textarea value={notes} onChange={(e) => handleNotesChange(e)} rows={8} id="notes" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div>
        </div>
      );
    }
  }