import {  useAppSelector } from "@/state/hook";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import debounce  from "lodash/debounce"
import { ColorResult, SketchPicker } from 'react-color';
import { Accordion, Dropdown } from 'flowbite-react';

import { selectSelected } from "@/state/canvas.slice";
import diagramInstance from "../../canvas/CanvasDiagram";
import { isEqual } from "lodash";
import Race from "./Race";
import Classes from "./Class";
import Ability from "./Ability";
import Spells from "./Spells";
import Background from "./Background";
import CharacterButton from "../../common/CharacterButton";




export default function CharacterPanel() {
    const selectedData = useAppSelector(selectSelected);

    if(selectedData === null){
      return null;
    } else {
      // selected data
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
          if(name.length){
            diagram?.model.commit(m => {  // m == the Model
              m.set(node?.data, "text", name);
            }, "change node name");
          } else {
            diagram?.model.commit(m => {  // m == the Model
              m.set(node?.data, "text", ' ');
            }, "change node name");
          }

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
        <div className="w-full h-full dark:bg-slate-600 overflow-scroll min-w-['270px']">
          <div className="p-2 w-full flex flex-row justify-between">
            <p className="w-full text-lg dark:text-white text-center">Character Editor</p>
            <CharacterButton characterKey={key} name={text} />
          </div>
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
                <Accordion.Panel>
                    <Ability/>
                </Accordion.Panel>
                <Accordion.Panel>
                    <Spells/>
                </Accordion.Panel>
                <Accordion.Panel>
                    <Background/>
                </Accordion.Panel>
            </Accordion>
          </div>
        </div>
      );
    }
  }