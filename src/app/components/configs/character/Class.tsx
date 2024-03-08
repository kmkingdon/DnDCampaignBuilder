import { useAppDispatch, useAppSelector } from "@/state/hook";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, SetStateAction, useEffect, useState } from "react";
import { Accordion, List } from 'flowbite-react';

import characterConfig from '../characterConfig.json';
import {  useGetClassQuery, useGetEquipmentCategoryQuery } from "@/state/api.dnd";
import { selectCharacters, updateCharacterParam } from '@/state/config.slice';
import { selectSelected } from "@/state/canvas.slice";





export default function Classes() {
    const dispatch = useAppDispatch();
    const selectedData = useAppSelector(selectSelected);
    const characterData= useAppSelector(selectCharacters);

    if(selectedData === null){
      return null;
    } else {
      // selected data
      const {key} = selectedData;
      // character data
      const character = characterData[key] ? characterData[key] : null;


    // class
    const classParam = character?.class ? character.class : '';
    const  [classes, setClasses] = useState<string>(classParam|| '')
    const { data: classesData, error: errorClasses, isLoading: isLoadingClasses } = useGetClassQuery(classes, {
        skip: !classes.length,
    });
    console.log({classesData})
    useEffect(() => {
        dispatch(updateCharacterParam({id:key, type:'class', value:classes}))
    }, [classes])


    // skill proficiency
    const skillsParam = character?.skills ? character.skills : [];
    const  [skillProficiency, setSkillProficiency] = useState<string[]>([...skillsParam])
    const handleSkillSelection =(params: { options: any; max: any; }) => {
        const { options, max} = params;
        const skillsSelected:string[] = []

        Array.from(options).forEach((s:any) => {
            if(s.selected){
                skillsSelected.push(s.value)
            } 
        });

        setSkillProficiency(skillsSelected.slice(0, max))
    };
    
    useEffect(() => {
        dispatch(updateCharacterParam({id:key, type:'skills', value:skillProficiency}))
    }, [skillProficiency])

    // equipment
    const equipmentParam = character?.equipment ? character.equipment : [];
    const  [equipment, setEquipment] = useState<string[]>([...equipmentParam])
    const handleEquipmentSelection =(params: { value: string, index: number }) => {
        const { value, index } = params;
        const equipmentSelected:string[] = [...equipment]
        equipmentSelected[index] = value;
        setEquipment(equipmentSelected)
    };
    
    useEffect(() => {
        dispatch(updateCharacterParam({id:key, type:'equipment', value:equipment}))
    }, [equipment])

    // equipment category
    const equipmentCategoryParam = character?.equipmentCategory ? character.equipmentCategory : '';
    const  [equipmentCategory, setEquipmentCategory] = useState<string>(equipmentCategoryParam);

    useEffect(() => {
        console.log({equipmentCategory})
        dispatch(updateCharacterParam({id:key, type:'equipmentCategory', value:equipmentCategory}))
    }, [equipmentCategory])

    useEffect(()=> {
        if(!isLoadingClasses && classesData){
            classesData.starting_equipment_options.forEach((i: { from: { equipment_category: { index: SetStateAction<string>; }; }; }) => {
                if(i.from.equipment_category){
                    setEquipmentCategory(i.from.equipment_category.index)
                }
            })
        }
    }, [isLoadingClasses, classesData])

    const { data: equipmentCategoryData, error: errorEquipmentCategory, isLoading: isLoadingEquipementCategory } = useGetEquipmentCategoryQuery(equipmentCategory, {
        skip: !equipmentCategory.length,
    });

    return (
        <>
            <Accordion.Title>Class</Accordion.Title>
            <Accordion.Content>
                <div className="pt-2">
                    <label htmlFor="classes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Class</label>
                    <div className="flex flex-row  justify-around">
                        <select value={classes} onChange={(e)=> setClasses(e.target.value)} id="classes" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option selected>Class</option>
                            {
                                    characterConfig.classes.map((i)=> {
                                        return <option value={i}>{i}</option>
                                    })
                            }
                        </select>
                    </div>
                </div>
                {
                    classesData && 
                    <>
                    <div className="pt-2">
                        <List>
                            <List.Item className="text-xs text-white">Hit Dice: {classesData?.hit_die}</List.Item>
                        </List>
                    </div>
                    <div className="pt-4">
                        <label htmlFor="proficiency" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Proficiencies</label>
                        <List>
                            {
                                classesData.proficiencies.map((p: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }) => <List.Item className="text-xs text-white">{p.name}</List.Item>)
                            }
                        </List>
                        <div className="flex flex-col  justify-around pt-4">
                            <label htmlFor="skillProficiency" className="block text-sm font-medium text-gray-900 dark:text-white">Skill Proficiencies</label>
                            <p className="m-2 text-xs text-gray-500 dark:text-gray-400">{classesData.proficiency_choices[0].choose > 1 ? `Use CTRL key to select ${classesData.proficiency_choices[0].choose}` : 'Select One' }</p>
                            <select multiple={classesData.proficiency_choices[0].choose > 1} value={skillProficiency} onChange={(e)=> handleSkillSelection({options:e.target.options, max:classesData.proficiency_choices[0].choose})} id="skillProfiency" className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                {
                                    classesData.proficiency_choices[0].from.options.map((p: { item: { index: string | number | readonly string[] | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }; })=> {
                                        return <option value={p.item.index}>{p.item.name}</option>
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    <div className="pt-4">
                        <label htmlFor="equipment" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Equipment</label>
                        <List>
                            {
                                classesData.starting_equipment.map((e: { equipment: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }; }) => <List.Item className="text-xs text-white">{e.equipment.name}</List.Item>)
                            }
                        </List>
                        <div className="flex flex-col  justify-around">
                            {
                                classesData.starting_equipment_options.map((o: { index: any; from: {
                                    [x: string]: void[]; options: any[]; }; }, index: any) => {
                                    return (
                                        <div className="p-1">
                                            <select value={equipment[index]} onChange={(e)=> handleEquipmentSelection({value:e.target.value, index: index})} id={`equipment-${o.index}`} className="w-[80%] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                                {
                                                    o.from.options &&
                                                    o.from.options.map((p:any) => {
                                                        if(p.option_type === 'counted_reference'){
                                                            return <option value={p.of.index}>{p.of.name}</option>
                                                        }
                                                        if(p.option_type === 'choice'){
                                                            return <option value={p.choice.from.equipment_category.index}>{p.choice.from.equipment_category.name}</option>
                                                        }
                                                        if(p.option_type === 'multiple'){
                                                            let value = '';
                                                            let name = ''; 
                                                            p.items.forEach((i: { option_type: string; of: { index: any; name: any; }; choice: { from: { equipment_category: { index: any; name: any; }; }; }; }, index: number) => {
                                                                if(i.option_type === 'counted_reference'){
                                                                    if(index === 0){
                        
                                                                        value = `${i.of.index}`
                                                                        name = `${i.of.name}`
                                                                    } else {
                                                                        value = `${value}_${i.of.index}`
                                                                        name = `${name} and ${i.of.name}`
                                                                    }
                                                                }

                                                                if(i.option_type === 'choice'){
                                                                    if(index === 0){
                                                                        value = `${i.choice.from.equipment_category.index}`
                                                                        name = `${i.choice.from.equipment_category.name}`
                                                                    } else {
                                                                        value = `${value}_${i.choice.from.equipment_category.index}`
                                                                        name = `${name} and ${i.choice.from.equipment_category.name}`
                                                                    }
                                                                }
                                                            })
                                                            return <option value={value}>{name}</option>
                                                        }
                                                        return null;
                                                    })
                                                }
                                                {
                                                    equipmentCategoryData &&
                                                    equipmentCategoryData.equipment.map((e: { key: string | number | readonly string[] | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }) => {
                                                        return <option value={e.key}>{e.name}</option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                    )
                                })
                            }

                        </div>
                    </div>
                </>

                }
            </Accordion.Content>
        </>
      );
    }
  }