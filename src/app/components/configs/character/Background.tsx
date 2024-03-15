import { useAppDispatch, useAppSelector } from "@/state/hook";
import React, {  ChangeEvent, useEffect, useMemo, useState } from "react";
import { Accordion } from 'flowbite-react';
import debounce from "lodash/debounce"

import {  selectCharacters,  updateCharacterParam } from '@/state/config.slice';
import { selectSelected } from "@/state/canvas.slice";



export default function Background() {
    const dispatch = useAppDispatch();
    const selectedData = useAppSelector(selectSelected);
    const characterData= useAppSelector(selectCharacters);

    // selected data
    const key  = selectedData?.key;
    // character data
    const character = characterData[key] ? characterData[key] : {};
 
    // background logic
    const backgroundParam = character.background ? character.background : '';
    const  [background, setBackground] = useState<string>(backgroundParam)
    const debouncedBackgroundChange= useMemo(() => debounce((background) => setBackground(background), 10), []
    );
    const handleBackgroundChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const notes = e.target.value;
        debouncedBackgroundChange(notes);
    }

    useEffect(() => {
        if(background.length){
            dispatch(updateCharacterParam({id:key, type:'background', value:background}))
        }
    }, [background])


    return (
        <>
            <Accordion.Title>Background</Accordion.Title>
            <Accordion.Content>
                <div className="w-full p-2">
                    <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Background Notes</label>
                    <textarea value={background} onChange={(e) => {handleBackgroundChange(e)}} rows={8} id="background" className="scroll-pb-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
            </Accordion.Content>
        </>
    );
      
}