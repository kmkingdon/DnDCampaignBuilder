import { useAppDispatch, useAppSelector } from "@/state/hook";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import debounce  from "lodash/debounce"
import { ColorResult, SketchPicker } from 'react-color';
import { Accordion, Dropdown } from 'flowbite-react';

import { selectSessions, updateSession } from '@/state/config.slice';
import { selectDiagramDataConfig, selectSelected } from "@/state/canvas.slice";
import diagramInstance from "../canvas/CanvasDiagram";
import { isEqual } from "lodash";
import Character from "../common/Character";
import CharacterButton from "../common/CharacterButton";


export default function Session() {
    const dispatch = useAppDispatch();
    const selectedData = useAppSelector(selectSelected);
    const sessionData = useAppSelector(selectSessions);
    const configData = useAppSelector(selectDiagramDataConfig)

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



      // notes logic
      const notesFromSession = sessionData[key] ? sessionData[key].notes : '';
      const  [notes, setNotes] = useState<string>(notesFromSession)
      const debouncedNotesChange= useMemo(
        () => debounce((notes) => setNotes(notes), 10), []
      );
      const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const notes = e.target.value;
        debouncedNotesChange(notes);
      }

      useEffect(() => {
        dispatch(updateSession({id:key, notes}))
      }, [notes])


      //character list
      const characterList = useMemo(() => {
        if(configData){

          const characterNodes = configData.nodeDataArray.map(n => {
            if(n.category === 'character'){
              return n.key;
            }
          })

          const linkedCharacters = configData.linkDataArray.map(l => {
            if(l.to === key){
              let index = characterNodes.indexOf(l.from);
              if(index >= 0){
                return characterNodes[index];
              }
              return null;
            }
          })
          // filter out undefined
          return linkedCharacters.filter(i => {
            if(i){
              return i;
            }
          });
        }
      }, [configData])

      const getCharacterName = (key:string) => {
        let name = ''
        configData.nodeDataArray.forEach(i => {
          if(i.key === key){
            name = i.text;
          }
        })
        return name;
      }

      return (
        <div className="w-full h-full dark:bg-slate-700">
          <div className="w-full p-2 flex flex-row content-between">
            <div className="w-[80%]">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Session Name</label>
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
            <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notes</label>
            <textarea value={notes} onChange={(e) => handleNotesChange(e)} rows={8} id="notes" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
          </div>
          <Accordion collapseAll>
                <Accordion.Panel>
                  <Accordion.Title>Characters</Accordion.Title>
                  <Accordion.Content>
                    {
                      characterList && characterList.length &&
                      characterList.map(c => {
                        return (
                          <div className="w-full flex flex-row justify-between items-center">
                            <span className="text-white">{getCharacterName(c)}</span>
                            <CharacterButton characterKey={c} name={getCharacterName(c)} />
                          </div>
                        )
                      })
                    }
                  </Accordion.Content>
                </Accordion.Panel>
            </Accordion>
        </div>
      );
    }
  }