import { useAppDispatch, useAppSelector } from "@/state/hook";
import {  useEffect, useState } from "react";
import { Accordion } from 'flowbite-react';

import characterConfig from '../characterConfig.json';
import {  selectCharacters, updateAbilityChange } from '@/state/config.slice';
import { selectSelected } from "@/state/canvas.slice";
import { ABILITIES } from "@/app/common/constants";


export default function Ability() {
    const dispatch = useAppDispatch();
    const selectedData = useAppSelector(selectSelected);
    const characterData= useAppSelector(selectCharacters);

    // selected data
    const key  = selectedData?.key;
    // character data
    const character = characterData[key] ? characterData[key] : {};

  
      // text input change handle
      const checkValue = (value: string) => {
        const number = isNaN(value as unknown as number) ? 0 : parseInt(value, 10);
        if(number < 0){
          return 0;
        }
        if(number > 6){
          return 6;
        }
        return number;
      }

      const handleInputChange = ({type, value}:{type:string, value: string}) => {
        const updatedValue = checkValue(value);
        updateValue({type, value: updatedValue})
      }


      // increment logic
      const incrementProficiency = (score:number, increment:string) => {
        if(increment === 'add'){
          if(score < 6){
            score = score + 1;
          }
        } else {
          if(score > 0){
            score = score - 1;
          }
        }
        return score;
      }

      const incrementAbility= (score:number, increment:string) => {
        if(increment === 'add'){
          if(score < 20){
            score = score + 1;
          }
        } else {
          if(score > 0){
            score = score - 1;
          }
        }
        return score;
      }

      const increment = ({type, increment}:{type:string, increment:string}) => {
        let value = 0;
        switch(type) {
          case 'prof':
            value = incrementProficiency(prof, increment)
            break;
          case 'cha':
            value = incrementAbility(cha, increment)
            break;
          case 'con':
            value = incrementAbility(con, increment)
            break;
          case 'dex':
            value = incrementAbility(dex, increment)
            break;
          case 'int':
            value = incrementAbility(int, increment)
            break;
          case 'str':
            value = incrementAbility(str, increment)
            break;
          case 'wis':
            value = incrementAbility(wis, increment)
            break;
          default:
            break;
        }
        updateValue({type, value})
      }

      //params from state
      const profParam = character?.ability?.prof?.score  || 0;
      const chaParam = character?.ability?.cha?.score  || 10;
      const conParam = character?.ability?.con?.score  || 10;
      const dexParam = character?.ability?.dex?.score  || 10;
      const intParam = character?.ability?.int?.score  || 10;
      const strParam = character?.ability?.str?.score  || 10;
      const wisParam = character?.ability?.wis?.score  || 10;

      useEffect(() => {
        // ensure local state is aligned with redux- shows bonus values
        if(character && character.ability){
          characterConfig.ability.forEach(a => {
            // @ts-ignore - ability will be defined when race is selected- this panel is not shown before race is selected
            const valueInfo:{score:number} = character?.ability[a]
            updateValue({type: a, value: valueInfo.score})
          })
        }
      }, [character.ability])
      
      //component state
      const  [prof, setProf] = useState<number>(profParam);
      const  [cha, setCha] = useState<number>(chaParam);
      const  [con, setCon] = useState<number>(conParam);
      const  [dex, setDex] = useState<number>(dexParam);
      const  [int, setInt] = useState<number>(intParam);
      const  [str, setStr] = useState<number>(strParam);
      const  [wis, setWis] = useState<number>(wisParam);

      const updateValue = ({type, value}: {type:string, value: number}) => {
        switch(type) {
          case 'prof':
            setProf(value)
            break;
          case 'cha':
            setCha(value)
            break;
          case 'con':
            setCon(value)
            break;
          case 'dex':
            setDex(value)
            break;
          case 'int':
            setInt(value)
            break;
          case 'str':
            setStr(value)
            break;
          case 'wis':
            setWis(value)
            break;
          default:
            break;
        }
      }

      const getValue = ({type}: {type:string}) => {
        switch(type) {
          case 'prof':
            return prof;
          case 'cha':
            return cha;
          case 'con':
            return con;
          case 'dex':
            return dex;
          case 'int':
            return int;
          case 'str':
            return str;
          case 'wis':
            return wis;
          default:
            return 0;
        }
      }


      // update redux
      useEffect(() => {
          dispatch(updateAbilityChange({id:key, type:'prof', value: prof}))
      }, [prof])
      useEffect(() => {
        dispatch(updateAbilityChange({id:key, type:'cha', value: cha}))
      }, [cha])
      useEffect(() => {
      dispatch(updateAbilityChange({id:key, type:'con', value: con}))
      }, [con])
      useEffect(() => {
      dispatch(updateAbilityChange({id:key, type:'dex', value: dex}))
      }, [dex])
      useEffect(() => {
        dispatch(updateAbilityChange({id:key, type:'int', value: int}))
      }, [int])
      useEffect(() => {
        dispatch(updateAbilityChange({id:key, type:'str', value: str}))
      }, [str])
      useEffect(() => {
        dispatch(updateAbilityChange({id:key, type:'wis', value: wis}))
      }, [wis])


      if(character && character.race && character.race.length){
        return (
          <>
              <Accordion.Title>Abilities</Accordion.Title>
                  <Accordion.Content>
                      <div className="pt-2 flex flex-col justify-center items-center">
                        <label htmlFor="quantity-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Proficiency Bonus:</label>
                        <div className="relative flex items-center max-w-[8rem]">
                            <button  onClick={() => increment({type: 'prof', increment:'subtract'})} type="button" id="decrement-button" data-input-counter-decrement="quantity-input" className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
                                </svg>
                            </button>
                            <input  onChange={(e) => handleInputChange({type: 'prof', value: e.target.value}) } value={getValue({type:'prof'})} minLength={0} maxLength={1} type="text" id="quantity-input" data-input-counter aria-describedby="helper-text-explanation" className="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="2"/>
                            <button onClick={() => increment({type: 'prof', increment:'add'})} type="button" id="increment-button" data-input-counter-increment="quantity-input" className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
                                </svg>
                            </button>
                        </div>
                      </div>
                      <div className="pt-2 flex flex-row flex-wrap justify-center">
                        {
                          characterConfig.ability.map((a: string) => {
                              return (
                                <div className="flex flex-col justify-center item-center m-2">
                                  <label htmlFor={`quantity-input-${a}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{ABILITIES[a]}</label>
                                  <div className="relative flex items-center max-w-[8rem]">
                                      <button  onClick={() => increment({type: a, increment:'subtract'})} type="button" id="decrement-button" data-input-counter-decrement="quantity-input" className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                          <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
                                          </svg>
                                      </button>
                                      <input  onChange={(e) => handleInputChange({type: a, value: e.target.value}) } value={getValue({type:a})} minLength={0} maxLength={2} type="text" id="quantity-input" data-input-counter aria-describedby="helper-text-explanation" className="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="2"/>
                                      <button onClick={() => increment({type: a, increment:'add'})} type="button" id="increment-button" data-input-counter-increment="quantity-input" className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                          <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
                                          </svg>
                                      </button>
                                  </div>
                                  <p className="m-2 text-xs text-gray-500 dark:text-gray-400">{`Bonus: ${character?.ability ? character.ability[a].bonus : 0}`}</p>
                                </div>
                              )
                          })
                        }
 
                      </div>
                  </Accordion.Content>
              </>
        );
      }
      // race not selected yet
      return (
        <>
          <Accordion.Title>Abilities</Accordion.Title>
          <Accordion.Content>
            <div className="w-full h-full flex flex-col justify-center items-center">
              <p className="m-2 text-m text-gray-500 dark:text-gray-400">Please select a race before setting ability scores.</p>
            </div>
          </Accordion.Content>
        </>

      )
    
      
    
  }