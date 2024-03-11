import NewWindow from 'react-new-window'
import { MdOpenInNew } from "react-icons/md";

import { useAppSelector } from '@/state/hook';
import { selectCharacters } from '@/state/config.slice';
import { Button,  Tooltip } from 'flowbite-react';
import { useMemo, useState } from 'react';
import { selectSelected } from '@/state/canvas.slice';
import { useGetClassQuery, useGetRaceQuery } from '@/state/api.dnd';
import { ABILITIES, ABILITY_BONUS } from '@/app/common/constants';



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


export default function Character() {
        const selectedData = useAppSelector(selectSelected);

        if(selectedData === null){
            return null;
        } else {
            const {key, text, color } = selectedData;
            // character data
            const characterData= useAppSelector(selectCharacters);
            const character = characterData[key]
            
            //new window control
            const [openWindow, setOpenWindow] = useState<boolean>(false);

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
            const proficiencyBonus = abilities['prof'].score;

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
                console.log({score, bonus, proficiencyBonus, bonusNumber, finalBonus})
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
                    console.log({savingThrowsString})
                    return savingThrowsString;
                }
            }, [classData]);


            const skillsString= useMemo(() => {
                if(classData && classData.proficiency_choices && character && character.skills){
                    let skillsString:string = '';
                    console.log({character})
                    classData.proficiency_choices[0].from.options.forEach((i: { item: { index: string; name: string; }; }) => {
                        // @ts-ignore
                        skillsString = `${skillsString}  ${character.skills.includes(i.item.index) ? `${i.item.name}` : '' }`
                    })
                    console.log({skillsString})
                    return skillsString;
                }
            }, [classData]);



            console.log({raceData, classData});

            return (
                <>
                    <Tooltip content="Launch character sheet in new window" style="light" theme={{ style: {light:"w-80 border border-gray-200 bg-white text-gray-900"}  }}>
                        <Button onClick={() => setOpenWindow(!openWindow)}color="transparent" className="w-8 h-8">
                            <MdOpenInNew size="25" color="white"/>
                        </Button>
                    </Tooltip>
                    {
                        openWindow &&
                        <NewWindow onUnload={() => setOpenWindow(false)} title={text} center="screen">
                            <div className="w-vh h-full bg-[#F8F2D8] overflow-x-hidden overflow-y-scroll">
                                <div className="w-full h-6" x-data="{ dynamicColor: {{ $sessionColor }} }" style={{ backgroundColor: color }}></div>
                                <div className="px-4 py-1">
                                    <h1 className="text-[#9B2818] text-3xl">{text}</h1>
                                </div>
                                <div className="px-4">
                                    <p className="text-black text-lg italic">{`${raceData.size} ${character.alignment}`}</p>
                                </div>
                                <Divider/>
                                <div className="px-4 py-1">
                                    <p className="text-[#9B2818] text-md">
                                        <span className="font-bold">Armor Class:</span>{''}
                                    </p>
                                    <p className="text-[#9B2818] text-md">
                                        <span className="font-bold">Hit Points:</span>{''}
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
                                        {
                                            character.traits.map((t: { desc: string[]; name: string }) => {
                                                console.log()
                                                return (
                                                <Tooltip content={t.desc.join('\n')} style="light" theme={{ style: {light:"w-80 border border-gray-200 bg-white text-gray-900"}  }}>
                                                    <span  className="text-[#9B2818] text-md cursor-help mx-3">
                                                        {t.name}
                                                    </span>
                                                </Tooltip>
                                                )
                                            })
                                        }
                                    </p>
                                </div>
                                <Divider/>
                                <div className="px-4">
                                    <h1 className="text-[#9B2818] text-xl">Description</h1>
                                </div>
                                <SimpleDivider/>
                                <div className="px-4 py-1">
                                    <p>{character.background}</p>
                                </div>
                            </div>
                        </NewWindow>
                    }
                </>
            )
        }

}