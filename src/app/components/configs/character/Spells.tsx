import { useAppDispatch, useAppSelector } from "@/state/hook";
import {  ChangeEvent, useEffect, useMemo, useState } from "react";
import { Accordion, Dropdown, DropdownDivider, List, Tooltip } from 'flowbite-react';

import {  selectCharacters,  updateCharacterParam } from '@/state/config.slice';
import { selectSelected } from "@/state/canvas.slice";
import { useGetSpellcastingQuery, useGetSpellsQuery } from "@/state/api.dnd";



export default function Spells() {
    const dispatch = useAppDispatch();
    const selectedData = useAppSelector(selectSelected);
    const characterData= useAppSelector(selectCharacters);

    // selected data
    const key  = selectedData?.key;
    // character data
    const character = characterData[key] ? characterData[key] : {};
    const classes = character?.class || ''


    //spellcasting info
    const { data: spellInfoData, error: errorSpellInfo, isLoading: isLoadingSpellInfo } = useGetSpellcastingQuery(classes, {
        skip: !classes.length,
    });


    //spells
    const spellsParam = character?.spells || [];
    const  [spells, setSpells] = useState<string[]>(spellsParam);

    const handleSpellSelection = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const id = e.target.id;
        const updatedArray = [...spells];
        if(checked){
            if(!updatedArray.includes(id)){
                updatedArray.push(id);
            } 
        } else {
            if(updatedArray.includes(id)){
                const index = updatedArray.indexOf(id);
                if (index > -1) { 
                    updatedArray.splice(index, 1); 
                }
            } 
        }
        setSpells(updatedArray);
    };

    useEffect(() => {
        if(spells.length){
            dispatch(updateCharacterParam({id:key, type:'spells', value:spells}))
        }
    }, [spells])

    // spells data
    const { data: spellsData, error: errorSpells, isLoading: isLoadingSpells } = useGetSpellsQuery(classes, {
        skip: !classes.length,
    });

    //search
    const  [spellSearch, setSpellSearch] = useState<string>('');
    const handleSpellSearch= (value:string) => {
        setSpellSearch(value)
    }

    const filteredSpells = useMemo(() => {
        if(spellsData && spellsData.results){
            if(spellSearch.length){
                return spellsData.results.filter((s: { name: string }) => {
                    return s.name.includes(spellSearch)
                })
            } else {
                return spellsData.results;
            }
        }
        return [];
    }, [spellSearch, spellsData])

    const isSpellChecked = (index:string) => {
        return spells.includes(index);
    }
    



    if(character && character.class && character.class.length){
        return (
          <>
              <Accordion.Title>Spellcasting</Accordion.Title>
                  <Accordion.Content>
                    {
                        spellInfoData && 
                        <div className="pt-2">
                            <label htmlFor="spellcastingInfo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Spellcasting Information:</label>
                            {
                                spellInfoData.info.map((i: { desc: any[]; name: string }) => {
                                    return (
                                        <Tooltip  content={i.desc.join('\n')} style="light" theme={{ style: {light:"w-80 border border-gray-200 bg-white text-gray-900"}  }}>
                                            <List.Item  key={i.name as string} className="text-sm pb-2 text-white cursor-help">
                                                {i.name}
                                            </List.Item>
                                        </Tooltip>
                                    )
                                })
                            }

                        </div>
                    }
                    {
                        spellsData &&
                        <div className="w-full flex flex-row justify-center">
                        <Dropdown label="Select Spells" dismissOnClick={false} className="p w-60" theme={{ floating: { target: "w-60"  } }}>
                            <div className="p-4">
                                <label htmlFor="spell-search" className="sr-only">Search</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor"
                                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd"
                                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                            clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <input value={spellSearch} onChange={(e) => handleSpellSearch(e.target.value)} onKeyDown={(e) => {e.stopPropagation()}} type="text" id="spell-search"
                                    className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Search spells..." />
                                </div>
                            </div>
                            <DropdownDivider />
                            <div className="w-full overflow-y-scroll h-[300px]">
                                {
                                filteredSpells.map((s: { index: string; name: string }) => {
                                        return (
                                            <Dropdown.Item key={s.index as string} className="w-full flex items-center" theme={{container:"w-full"}} >
                                                <input checked={isSpellChecked(s.index)} onChange={(e)=> handleSpellSelection(e)} id={s.index} type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                                <label htmlFor={s.index} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {s.name}
                                                </label>
                                            </Dropdown.Item>
                                        )
                                    })
                                }
                            </div>
                        </Dropdown>
                        </div>
                    }
                  </Accordion.Content>
              </>
        );
      }
      // class not selected yet
      return (
        <>
          <Accordion.Title>Spellcasting</Accordion.Title>
          <Accordion.Content>
            <div className="w-full h-full flex flex-col justify-center items-center">
              <p className="m-2 text-m text-gray-500 dark:text-gray-400">Please select a class before setting spells.</p>
            </div>
          </Accordion.Content>
        </>

      )
    
      
    
  }