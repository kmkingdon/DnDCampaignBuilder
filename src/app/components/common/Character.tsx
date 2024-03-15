import { useAppSelector } from '@/state/hook';
import {  selectCharacters } from '@/state/config.slice';
import { Dropdown,  Table,  Tooltip } from 'flowbite-react';
import {  useMemo, useState } from 'react';
import { selectDiagramDataConfig } from '@/state/canvas.slice';
import { useGetClassQuery, useGetRaceQuery, useGetSpellSelectionQuery } from '@/state/api.dnd';
import { ABILITIES, ABILITY_BONUS, SKILLS_ABILITY } from '@/app/common/constants';
import Spell from './Spell';



const Divider = () => {
    return (
        <div className="px-4">
            <div className="w-0 h-0 
            border-t-[3px] border-t-transparent
            border-l-[100vw] border-l-[#9B2818]
            border-b-[3px] border-b-transparent">
            </div>
        </div>
    )
}

const SimpleDivider = () => {
    return (
        <div className="px-4">
            <div className="w-full border-t border-t-solid border-t-[#9B2818]"></div>
        </div>
    )
}


export default function Character(params:{characterKey:string}) {
        const { characterKey} = params;
        const configData = useAppSelector(selectDiagramDataConfig)
 



        const nodeData = useMemo(() => {
            const configs = configData.nodeDataArray.map(n => {
                if(n.key === characterKey){
                    return {text: n.text, color: n.color}
                }
            })
            const filteredConfigs = configs.filter(fc => {
                if(fc){
                    return fc
                }
            })
            return filteredConfigs[0];
        }, [characterKey, configData])
        const {text, color} = nodeData || {text:'', color:''};

        // character data
        const characterData= useAppSelector(selectCharacters);
        const character = characterData[characterKey]
  


        //data calls
        const race = character?.race || '';
        const { data: raceData, error: errorRace, isLoading: isLoadingRace } = useGetRaceQuery(race, {
            skip: !race?.length,
        });

        const classes = character?.class || '';
        const { data: classData, error: errorClass, isLoading: isLoadingClass } = useGetClassQuery(classes, {
            skip: !classes?.length,
        });

        const abilities = character?.ability || {};
        const proficiencyBonus = abilities['prof'] ? abilities['prof'].score : 0;

        const languageString= useMemo(() => {
            if(raceData && raceData.languages){
                let languageString:string = '';
                raceData.languages.forEach((l: { name: string; }, index: number) => {
                    if(index === 0){
                        languageString = `${l.name}`;
                    } else {
                        languageString = `${languageString}, ${l.name}`
                    }
                })
                return languageString;
            }
        }, [raceData]);


        const getProficiencyBonus = (index: string) => {
            const score = abilities[index].score;
            const bonus = ABILITY_BONUS[score];
            const bonusNumber = parseInt(bonus.replace('+', ''), 10);
            const finalBonus = bonusNumber + proficiencyBonus;
            return finalBonus;
        }

        const savingThrowsString= useMemo(() => {
            if(classData && classData.saving_throws){
                let savingThrowsString:string = '';
                classData.saving_throws.forEach((s: { name: string; index:string; }, index: number) => {
                    if(index === 0){
                        savingThrowsString = `${s.name}  +${getProficiencyBonus(s.index)}`;
                    } else {
                        savingThrowsString = `${savingThrowsString}, ${s.name} +${getProficiencyBonus(s.index)}`
                    }
                })
                return savingThrowsString;
            }
        }, [classData]);


        const skillsString= useMemo(() => {
            if(classData && classData.proficiency_choices && character && character.skills){
                let skillsString:string = '';
                classData.proficiency_choices[0].from.options.forEach((i: { item: { index: string; name: string; }; }) => {
                    const ability = SKILLS_ABILITY[i.item.index];
                    const bonus = getProficiencyBonus(ability);
                    // @ts-ignore
                    skillsString = `${skillsString}  ${character.skills.includes(i.item.index) ? `${i.item.name.split(':')[1]} ( + ${bonus})` : '' }`
                })
                return skillsString;
            }
        }, [classData, character]);

        
        const armor = useMemo(() => {
            if(character && character.actions){
                return character.actions.filter(i => {
                    if(i.type === 'armor'){
                        return i;
                    }
                })
            }
        }, [character])

        const weapons = useMemo(() => {
            if(character && character.actions){
                return character.actions.filter(i => {
                    if(i.type === 'weapon'){
                        return i;
                    }
                })
            }
        }, [character])

        const getWeaponBonus = (type:string) => {
            if(type === 'Simple Melee'){
                return getProficiencyBonus('str')
            }
            if(type === 'Simple Ranged'){
                return getProficiencyBonus('dex')
            }
            return 0
        }

        const adventuring_gear= useMemo(() => {
            if(character && character.actions){
                return character.actions.filter(i => {
                    if(i.type === 'adventuring-gear'){
                        return i;
                    }
                })
            }
        }, [character])


        const armorString= useMemo(() => {
            if(armor && armor.length){
                let armorBonus = 0;
                const dexBonus = getProficiencyBonus('dex');
                let armorString:string = '';
                armor.forEach((i, index) => {
                    if(index === 0){
                        armorString = i.name;
                        armorBonus = i.armor_class.base;
                    } else {
                        armorString = `${armorString} and ${i.name}`
                        armorBonus =  armorBonus + i.armor_class.base;
                    }
                })
                return `  ${armorBonus + dexBonus} (${armorString})`
            }
        }, [armor]);


        //spells
        const  [spellSelection, setSpellSelection] = useState<string>('');
        const { data: spellSelectionData, error: errorSpellSelection, isLoading: isLoadingSpellSelection } = useGetSpellSelectionQuery(spellSelection, {
            skip: !spellSelection.length,
        });

        //hp
        const hpString= useMemo(() => {
            if(classData){
                const level = character.level || 1;
                const hitDie = classData.hit_die;
                const conScore = abilities['con'].score;
                const conBonus = parseInt(ABILITY_BONUS[conScore], 10);
            
                const conPoints = conBonus * level;
                const dicePoints = hitDie * (level * .7)
                return `${Math.floor(conPoints + dicePoints)} (${level}d${hitDie} + ${conPoints})`;
            }
        }, [classData, character]);


        return (

                        <div className="w-vh h-full bg-[#F8F2D8] overflow-x-hidden overflow-y-scroll">
                            <div className="w-full h-6" x-data="{ dynamicColor: {{ $sessionColor }} }" style={{ backgroundColor: color }}></div>
                            <div className="px-4 py-1">
                                <h1 className="text-[#9B2818] text-3xl">{`${text} ( ${character.race} ${character.class})`}</h1>
                            </div>
                            <div className="px-4">
                                <p className="text-black text-lg italic">{`${raceData.size} ${character.alignment}`}</p>
                            </div>
                            <Divider/>
                            <div className="px-4 py-1">
                                <p className="text-[#9B2818] text-md">
                                    <span className="font-bold">Armor Class:</span>
                                    <span>{armorString}</span>
                                </p>
                                <p className="text-[#9B2818] text-md">
                                    <span className="font-bold">Hit Points:</span>{''}
                                    <span className="ml-2">{hpString}</span>
                                </p>
                                <p className="text-[#9B2818] text-md">
                                    <span className="font-bold">Speed:</span>
                                    <span className="ml-2">{`${raceData.speed} ft`}</span>
                                </p>
                            </div>
                            <Divider/>
                            <div className="px-4 py-1">
                                <div className="w-full flex flew-row flex-wrap">
                                    {
                                        Object.entries(abilities).map(a => {
                                            const index = a[0];
                                            // @ts-ignore
                                            const score = a[1].score
                                            if(index === 'prof'){
                                                return null;
                                            }
                                            return (
                                                <div className="w-20 flex flex-col items-center mx-4">
                                                    <p className="text-[#9B2818] text-md">
                                                        <span className="font-bold">{ABILITIES[index]}</span>
                                                    </p>
                                                    <p className="text-[#9B2818] text-md">
                                                        <span className="">{score}</span>
                                                        <span className="">{`  (${ABILITY_BONUS[score]})`}</span>
                                                    </p>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <Divider/>
                            <div className="px-4 py-1">
                                <p className="text-[#9B2818] text-md">
                                    <span className="font-bold">Saving Throws:</span>
                                    <span className="ml-2">{savingThrowsString}</span>
                                </p>
                                <p className="text-[#9B2818] text-md">
                                    <span className="font-bold">Skills:</span>
                                    <span className="ml-2">{skillsString}</span>
                                </p>
                                <p className="text-[#9B2818] text-md">
                                    <span className="font-bold">Languages:</span>
                                    <span className="ml-2">{languageString}</span>
                                </p>
                                <p className="text-[#9B2818] text-md">
                                    <span className="font-bold">Proficiency Bonus:</span>
                                    <span className="ml-2">{`+ ${abilities['prof'].score}`}</span>
                                </p>
                                <p className="text-[#9B2818] text-md flex flex-row">
                                    <span className="font-bold">Traits:</span>
                                </p>
                                <div className="w-full flex flew-row flex-wrap">
                                    {
                                        character.traits.map((t: { desc: string[]; name: string }) => {
                                            return (
                                            <Tooltip content={t.desc.join('\n')} style="light" theme={{ style: {light:"w-80 border border-gray-200 bg-white text-gray-900"}  }}>
                                                <p className="text-[#9B2818] text-md cursor-help mx-3 italic">
                                                    {t.name}
                                                </p>
                                            </Tooltip>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <Divider/>
                            {
                                adventuring_gear && adventuring_gear.length &&
                                <>
                                <div className="px-4">
                                    <h1 className="text-[#9B2818] text-xl">Equipment:</h1>
                                    <div className="w-full flex flew-row flex-wrap py-2">
                                        {  adventuring_gear.map((a) => {
                                                if(a.contents && a.contents.length){
                                                    const content = a.contents.map((c: { item: { name: any; }; }) => {
                                                        return c.item.name;
                                                    })
                                                    return (
                                                        <Tooltip content={content.join(', ')} style="light" theme={{ style: {light:"w-80 border border-gray-200 bg-white text-gray-900"}  }}>
                                                            <p className="text-[#9B2818] text-md cursor-help mx-3 italic">
                                                                {a.name}
                                                            </p>
                                                        </Tooltip>
                                                    )
                                                } else {
                                                    return (
                                                        <Tooltip content={a.desc} style="light" theme={{ style: {light:"w-80 border border-gray-200 bg-white text-gray-900"}  }}>
                                                            <p className="text-[#9B2818] text-md cursor-help mx-3 italic">
                                                                {a.name}
                                                            </p>
                                                        </Tooltip>
                                                    )
                                                }
                                            })
                                        }
                                    </div>
                                </div>
                                <SimpleDivider/>
                                </>
                            }
                            <div className="px-4">
                                <h1 className="text-[#9B2818] text-xl">Weapons:</h1>
                                <div className="w-full flex flex-col py-2">
                                <Table>
                                    <Table.Head className="bg-transparent">
                                        <Table.HeadCell className="bg-transparent">Weapon</Table.HeadCell>
                                        <Table.HeadCell className="bg-transparent">Range</Table.HeadCell>
                                        <Table.HeadCell className="bg-transparent">Hit/DC</Table.HeadCell>
                                        <Table.HeadCell className="bg-transparent">Damage</Table.HeadCell>
                                        <Table.HeadCell className="bg-transparent">Damage Type</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body className="divide-y">
                                        {   weapons && weapons.length &&
                                            weapons.map((w) => {
                                                return (
                                                    <Table.Row className="dark:border-gray-700 dark:bg-gray-800">
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white py-0">
                                                            {w.name}
                                                        </Table.Cell>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white py-0">
                                                            {`${Object.values(w.range).join('/')} ${Object.values(w.range).length === 1 ? 'ft' : ''}`}
                                                        </Table.Cell>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white py-0">
                                                            { `+ ${getWeaponBonus(w.category_range)}`}
                                                        </Table.Cell>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white py-0">
                                                            {w.damage.damage_dice}
                                                        </Table.Cell>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white py-0">
                                                            {`${w.damage.damage_type.name}`}
                                                        </Table.Cell>
                                                    </Table.Row >
                                                )
                                            })
                                        }
                                    </Table.Body>
                                    </Table>
                                </div>
                            </div>
                            {
                                character && character.spells && character.spells.length &&
                                <>
                                    <SimpleDivider/>
                                    <div className="px-4">
                                        <h1 className="text-[#9B2818] text-xl">Spells</h1>
                                    </div>
                                    <div className="w-full flex flew-row flex-wrap py-4 px-2">
                                        {
                                            character.spells.map(s => {
                                                return (
                                                    <div onClick={() => setSpellSelection(s)}>
                                                        <Dropdown  label="" dismissOnClick={false} className="w-[30rem]" renderTrigger={() => <p className="text-[#9B2818] text-md cursor-help italic mx-8 my-2">{s}</p>}>   
                                                            {
                                                                spellSelectionData &&
                                                                <Dropdown.Item  theme={{base:"!py-0 !px-0"}}>
                                                                    <Spell data={spellSelectionData} loading={isLoadingSpellSelection}/>
                                                                </Dropdown.Item>
                                                            }
                                                        </Dropdown>
                                                    </div>
                                                ) 
                                            })
                                        }
                                    </div>
                                </>

                            }

                            <SimpleDivider/>
                            <div className="px-4">
                                <h1 className="text-[#9B2818] text-xl">Description</h1>
                            </div>
                            <div className="px-4 py-1">
                                <div className="whitespace-pre text-wrap">{character.background}</div>
                            </div>
                        </div>
  
        )
    
}