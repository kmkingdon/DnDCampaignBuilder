import {  useAppSelector } from "@/state/hook";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import debounce  from "lodash/debounce"
import { ColorResult, SketchPicker } from 'react-color';
import { Accordion, Dropdown } from 'flowbite-react';

import {  selectCharacters} from '@/state/config.slice';
import { selectSelected } from "@/state/canvas.slice";
import diagramInstance from "../../canvas/CanvasDiagram";
import { isEqual } from "lodash";
import Race from "./Race";
import Classes from "./Class";




export default function CharacterPanel() {
    const selectedData = useAppSelector(selectSelected);
    const characterData= useAppSelector(selectCharacters);

    if(selectedData === null){
      return null;
    } else {
      // selected data
      const {key, text, color } = selectedData;
      // character data
      const character = characterData[key] ? characterData[key] : {};

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

      return (
        <div className="w-full h-full dark:bg-slate-700 overflow-scroll">
          <div className="w-full p-2 flex flex-row content-between">
            <div className="w-[80%]">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Character Name</label>
                <input value={name} onChange={(e) => handleNameChange(e)} type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
            </div>
            <div className="w-[20%] px-2 flex items-end relative">
                <Dropdown label="Color" dismissOnClick={false}  theme={{ floating: { target: "w-16 !bg-transparent border-none absolute z-10"  } }}> 
                    <SketchPicker
                        color={ sessionColor }
                        onChangeComplete={(color:ColorResult) => handleColorChange(color) }
                    />
                </Dropdown>
                <div className="w-10 h-10 absolute" x-data="{ dynamicColor: {{ $sessionColor }} }" style={{ backgroundColor: sessionColor }}>
                </div>
            </div>
          </div>
          <div className="w-full p-2">
            <Accordion collapseAll>
                <Accordion.Panel>
                    <Race />
                </Accordion.Panel>
                <Accordion.Panel>
                    <Classes />
                </Accordion.Panel>
            </Accordion>
          </div>
        </div>
      );
    }
  }