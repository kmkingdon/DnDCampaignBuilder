import { useAppDispatch, useAppSelector } from "@/state/hook";
import {  useEffect, useState } from "react";
import { Accordion,  List, Tooltip } from 'flowbite-react';
import { MdInfoOutline } from "react-icons/md";

import characterConfig from '../characterConfig.json';
import { useGetAlignmentQuery, useGetClassQuery, useGetRaceQuery } from "@/state/api.dnd";
import { getCharacterSubTraits, getCharacterTraits, selectCharacters, updateCharacterParam } from '@/state/config.slice';
import { selectSelected } from "@/state/canvas.slice";


export default function Race() {
    const dispatch = useAppDispatch();
    const selectedData = useAppSelector(selectSelected);
    const characterData= useAppSelector(selectCharacters);

    if(selectedData === null){
      return null;
    } else {
      // selected data
      const {key, text, color } = selectedData;
      // character data
      const character = characterData[key] ? characterData[key] : {};

      // alignment
      const alignmentParam = character.alignment ? character.alignment : '';
      const  [alignment, setAlignment] = useState<string>(alignmentParam || '')
      const { data: alignmentDesc, error: errorAlignment, isLoading: isLoadingAlignment } = useGetAlignmentQuery(alignment, {
        skip: !alignment.length,
      });

      useEffect(() => {
        dispatch(updateCharacterParam({id:key, type:'alignment', value:alignment}))
      }, [alignment])

    // race
    const raceParam = character.race ? character.race : '';
    const  [race, setRace] = useState<string>(raceParam || '')
    const { data: raceData, error: errorRace, isLoading: isLoadingRace } = useGetRaceQuery(race, {
        skip: !race.length,
    });

    useEffect(() => {
        dispatch(updateCharacterParam({id:key, type:'race', value:race}))
    }, [race])

    useEffect(() => {
        if(!isLoadingRace && !errorRace && raceData){
            dispatch(getCharacterTraits({id:key, traits: raceData.traits}))
        }
    }, [isLoadingRace, raceData])

    // race trait
    let subTraitParam: { [key: string]: string; } = {};
    let subTraitDescParam: { [key: string]: string; } = {};
    if(character.traits){
        character.traits.forEach((t: { hasOwnProperty: (arg0: string) => any; index: string | number; selected: { index: string; data:any; }; }) => {
            if(t.hasOwnProperty('selected')){
                console.log({t})
                subTraitParam[t.index] = t.selected.index;
                subTraitDescParam[t.index] = t.selected.data;
            }
        })
    }

    const  [subTraits, setSubtraits] = useState<{ [key: string]: string; }>(subTraitParam)
    const handleSubtrait = (params: { value: any; index: any; }) => {
        const { value, index } = params;
        console.log({value, index})
        setSubtraits({...subTraits, [index]: value})
        console.log({subTraits})
    }
    useEffect(() => {
        if(Object.keys(subTraits).length > 0){
            dispatch(getCharacterSubTraits({id:key, subTraits}))
        }
    }, [subTraits])



      return (
            <>
                <Accordion.Title>Race</Accordion.Title>
                    <Accordion.Content>
                        <div className="pt-2">
                            <label htmlFor="race" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Race</label>
                            <div className="flex flex-row  justify-around">
                                <select value={race} onChange={(e)=> setRace(e.target.value)} id="race" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option selected>Race</option>
                                    {
                                            characterConfig.races.map((i)=> {
                                                return <option value={i}>{i}</option>
                                            })
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="pt-2">
                            <label htmlFor="alignment" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Alignment</label>
                            <div className="flex flex-row  justify-around">
                                <select value={alignment} onChange={(e)=> setAlignment(e.target.value)} id="alignment" className="w-[80%] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option selected>Alignment</option>
                                    {
                                            characterConfig.alignment.map((i)=> {
                                                return <option value={i}>{i}</option>
                                            })
                                    }
                                </select>
                                <Tooltip content={alignmentDesc?.desc} style="light" theme={{ style: {light:"w-40 border border-gray-200 bg-white text-gray-900"}  }}>
                                    <div className="w-full h-full flex justify-center items-center">
                                        <MdInfoOutline size="25" color="white"/>
                                    </div>
                                </Tooltip>
                            </div>
                            <p className="m-2 text-xs text-gray-500 dark:text-gray-400">{raceData?.alignment}</p>
                        </div>
                        <div className="pt-2">
                            {
                                raceData && Object.keys(raceData).length &&
                                <List>
                                    <List.Item className="text-xs text-white">Size: {raceData?.size}</List.Item>
                                    <List.Item className="text-xs  text-white">Speed: {raceData?.speed}</List.Item>
                                    <List.Item className="text-xs  text-white">Languages: { raceData?.languages.map((i: { name: string; }) => `   ${i.name}   `)}</List.Item>
                                </List>
                            }
                        </div>
                        <div className="pt-2">
                            <label htmlFor="traits" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Traits</label>
                            {
                                character.traits  && 
                                <List>
                                    { character.traits.map((i: { name: string; desc: string[]; select: any | null; index:string; }) => { 
                                      return (
                                        <>
                                            <Tooltip content={JSON.stringify(i.desc)} style="light" theme={{ style: {light:"w-80 border border-gray-200 bg-white text-gray-900"}  }}>
                                                <List.Item  className="text-xs text-white cursor-help">
                                                    {i.name}
                                                </List.Item>
                                            </Tooltip>
                                            {
                                                i.select && 
                                                <div className="pt-2">
                                                    <div className="flex flex-row  justify-around">
                                                        <select value={i.index in subTraits ? subTraits[i.index] : ''} onChange={(e)=> handleSubtrait({value:e.target.value, index: i.index})} id={`trait-${i.name}`} className="w-[80%] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                                            <option selected>Select Subtrait</option>
                                                            { i.select.options.map((i:any) => <option value={i.index}>{i.name}</option>)}
                                                        </select>
                                                        <Tooltip content={i.index in subTraitDescParam  ? JSON.stringify(subTraitDescParam[i.index]) : ''} style="light" theme={{ style: {light:"w-100 border border-gray-200 bg-white text-gray-900"}  }}>
                                                            <div className="w-full h-full flex justify-center items-center">
                                                                <MdInfoOutline size="25" color="white"/>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            }
                                        </>
                                        )
                                    })
                                }
                            </List>
                            }
                        </div>
                    </Accordion.Content>
                </>
      );
    }
  }