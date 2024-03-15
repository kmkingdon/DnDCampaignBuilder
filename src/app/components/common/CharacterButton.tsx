import { MdOpenInNew } from "react-icons/md";
import { Button,  Tooltip } from 'flowbite-react';
import { useState } from "react";

import Character from './Character';
import NewWindow from "react-new-window";
import { selectCharacters } from "@/state/config.slice";
import { useAppSelector } from "@/state/hook";






export default function CharacterButton(params:{characterKey:string, name: string}) {
        const { characterKey , name } = params;
        
        
        // character data
        const characterData= useAppSelector(selectCharacters);
        const character = characterData[characterKey]

        const disableButton = !character?.race || !character?.class

        //new window control
        const [openWindow, setOpenWindow] = useState<boolean>(false);

        return (
            <>
                <Tooltip content={disableButton ? "Please select race and class" : "Launch character sheet in new window"} style="light" theme={{ style: {light:"w-80 border border-gray-200 bg-white text-gray-900"}  }}>
                    <Button disabled={disableButton} onClick={() => setOpenWindow(!openWindow)}color="transparent" className="w-8 h-8">
                        <MdOpenInNew size="25" color="white"/>
                    </Button>
                </Tooltip>
                {
                    openWindow &&
                    <NewWindow onUnload={() => setOpenWindow(false)} title={name} center="screen">
                        <Character characterKey={characterKey} />
                    </NewWindow>

                }
            </>
        )
    
}