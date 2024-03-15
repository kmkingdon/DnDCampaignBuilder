import { useAppDispatch, useAppSelector } from "@/state/hook";
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, SetStateAction, useEffect, useMemo, useState } from "react";
import { Accordion, List } from 'flowbite-react';

import characterConfig from '../characterConfig.json';
import {  useGetClassQuery, useGetEquipmentCategoryQuery } from "@/state/api.dnd";
import { getEquipment, selectCharacters, updateCharacterParam } from '@/state/config.slice';
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
    const equipmentParam = character?.equipment ? character.equipment : {};
    const  [equipment, setEquipment] = useState<{[key:string]: {value:string, selectId:string}}>({...equipmentParam})

    const handleEquipmentSelection =(params: { value: string, selectId: string}) => {
        const { value, selectId,} = params;
        const equipmentSelected:{[key:string]: {value:string, selectId:string}} = {...equipment}
        if(value.includes('_')){
            const array = value.split('_');
            array.forEach(i => {
                equipmentSelected[i] = {value: i , selectId};
            })
        } else {
            equipmentSelected[value] = {value, selectId};
        }
        setEquipment(equipmentSelected)
    };

    useEffect(() => {
        dispatch(updateCharacterParam({id:key, type:'equipment', value:{...equipment}}))
        
    }, [equipment])

    // add starting default equipment
    useEffect(() => {
        if(!isLoadingClasses && classesData){
            const equipmentSelected:{[key:string]: {value:string, selectId:string}} = {...equipment}
            classesData.starting_equipment.forEach((i: { equipment: { index: string; }; }) => {
                equipmentSelected[i.equipment.index]= {value:i.equipment.index, selectId: ''};
            })
            setEquipment(equipmentSelected);
        }
    }, [classesData, isLoadingClasses])


    // equipment category
    const equipmentCategoryParam = character?.equipmentCategory ? character.equipmentCategory : '';
    const  [equipmentCategory, setEquipmentCategory] = useState<string>(equipmentCategoryParam);

    useEffect(() => {
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

    const formatEquipmentCategory = (equipment:any) => {
        const optionsArray = equipment.map((i: any) => {
            return { count: 1, option_type: "counted_reference", of:i}
        })
        return {choose: 1, desc: "equipment_category", from: {option_set_type:"options_array", options: optionsArray}}
    }

    const finalEquipment = useMemo(() => {
        
        if(classesData && equipmentCategoryData){
            const equipmentCategory = formatEquipmentCategory(equipmentCategoryData.equipment)
            const filteredEquipment = classesData.starting_equipment_options.filter((e: { desc: string; }) => {
                if(e.desc === 'holy symbol' || e.desc === 'druidic focus'){
                    return;
                }
                return e;
            })
            return [...filteredEquipment, equipmentCategory ]
        }
        return [];
    }, [classesData, equipmentCategoryData]);

    useEffect(() => {
        if(Object.keys(equipment).length){
            dispatch(getEquipment({id:key, equipment: equipment}))
        }
    }, [equipment])

    const getSelectedValue = (id:string) =>{
        const valueArray = Object.values(equipment).filter(i => {
            if(i.selectId === id){
                return i;
            }
        })
        if(valueArray.length === 1){
            return valueArray[0]?.value || '';
        } else {
            let string = '';
            valueArray.forEach((i: {value: string}, index: number) => {
                if(index === 0){
                    string = `${i.value}`
                } else {
                    string = `${string}_${i.value}`
                }
            })
            return string;
        }

    } 

    //level
    const levelParam = character?.level || 1;
    const  [level, setLevel] = useState<number>(levelParam);

    const increment = (increment:string) => {
        let score = level;
        if(increment === 'add'){
            if(score < 20){
                score = score + 1;
            }
        } else {
            if(score > 1){
                score = score - 1;
            }
        }
        setLevel(score);
    }

    const checkValue = (value: string) => {
        const number = isNaN(value as unknown as number) ? 0 : parseInt(value, 10);
        if(number < 1){
          return 1;
        }
        if(number > 20){
          return 20;
        }
        return number;
      }

    const handleInputChange = ({value}:{type:string, value: string}) => {
        const updatedValue = checkValue(value);
        setLevel(updatedValue)
    }

    useEffect(() => {
        dispatch(updateCharacterParam({id:key, type:'level', value:level}))
    }, [level])


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
                    <div className="pt-2 flex flex-col justify-center items-center">
                        <label htmlFor="quantity-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Level:</label>
                        <div className="relative flex items-center max-w-[8rem]">
                                <button  onClick={() => increment('subtract')} type="button" id="decrement-button" data-input-counter-decrement="quantity-input" className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                    <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
                                    </svg>
                                </button>
                                <input  onChange={(e) => handleInputChange({type: 'prof', value: e.target.value}) } value={level} minLength={0} maxLength={2} type="text" id="quantity-input" data-input-counter aria-describedby="helper-text-explanation" className="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="2"/>
                                <button onClick={() => increment('add')} type="button" id="increment-button" data-input-counter-increment="quantity-input" className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
                                    <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
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
                            {   finalEquipment.length &&
                                finalEquipment.map((o: { desc: string; from: {
                                    [x: string]: void[]; options: any[]; }; }) => {

                                    return (
                                        <div className="p-1">
                                            <select value={getSelectedValue(o.desc)} onChange={(e)=> handleEquipmentSelection({value:e.target.value, selectId: o.desc})}  className="w-[80%] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                                <option value='default'>Choose one</option>
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
                                                        return;
                                                    })
                                                }
                                            </select>
                                        </div>
                                    )
                                })
                            }
                            {
                                Object.keys(equipment).includes('simple-weapons') &&
                                    <select value={getSelectedValue('simple-weapons-selected')} onChange={(e)=> handleEquipmentSelection({value:e.target.value, selectId:'simple-weapons-selected'})}  className="w-[80%] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option value='default'>Choose Simple Weapon</option>
                                        {characterConfig.simple_weapons.map(c => {
                                            return <option value={c.index}>{c.name}</option>
                                        })
                                        }
                                </select>
                            }
                                                        {
                                Object.keys(equipment).includes('simple-melee-weapons') &&
                                    <select value={getSelectedValue('simple-melee-weapons-selected')} onChange={(e)=> handleEquipmentSelection({value:e.target.value, selectId:'simple-melee-weapons-selected'})}  className="w-[80%] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option value='default'>Choose Simple Melee Weapon</option>
                                        {characterConfig.simple_melee_weapons.map(c => {
                                            return <option value={c.index}>{c.name}</option>
                                        })
                                        }
                                </select>
                            }           
                            {
                                Object.keys(equipment).includes('martial-weapons') &&
                                    <select value={getSelectedValue('martial-weapons-selected')} onChange={(e)=> handleEquipmentSelection({value:e.target.value, selectId:'martial-weapons-selected'})} className="w-[80%] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option value='default'>Choose Martial Weapon</option>
                                        {characterConfig.martial_weapons.map(c => {
                                            return <option value={c.index}>{c.name}</option>
                                        })
                                        }
                                </select>
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