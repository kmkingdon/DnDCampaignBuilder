import { Spinner } from "flowbite-react";

export default function Spell({data, loading}:{data:any, loading:boolean}) {
    if(data){
        const { name, school , level, concentration, casting_time, duration, components, range, desc, ritual} = data;
        const levels = ['Cantrip', '1st Level', '2nd Level', '3rd Level', '4th Level', '5th Level', '6th Level', '7th Level', '8th Level', '9th Level', '10th Level']
        
        if(loading){
            return (
                <div className="w-full p-4 h-96 flex flex-col justify-center items-center">
                    <Spinner aria-label="Default status example" />;
                </div>
            )
        }
        
        
        return (
            <div className="w-full p-4 max-h-96 overflow-y-scroll">
                <div className="w-full flex flex-col justify-center">
                    <div className="flex flex-row justify-center">
                        <p className="text-lg text-gray-900 dark:text-white">{name}</p>
                        { concentration &&
                            <div className="ml-4 relative top-[-1em] w-0 h-0 border-t-[1em] 
                            border-t-transparent border-solid border-x-transparent  border-x-[1em]  
                            border-b-[1em] border-black
                           
                            after:absolute after:left-[-1em] after:top-[1em]
                            after:h-0 after:w-0 after:border-b-[1em] after:border-solid 
                            after:border-x-transparent after:border-b-transparent after:border-x-[1em] 
                            after:border-t-[1em] after:border-t-black after:z-[-1]
                           ">
                             <span className="text-xs text-white block float-left mt-1.5 mb-2.5 mr-2.5 ml-[-5px]">C</span>
                           </div>
                           
                        }
                    </div>
                    <p className="text-md dark:text-gray-300 italic">{`${school.name} ${levels[level]}`}</p>
                </div>
                <div className="my-2 border-t-2 solid border-gray-300"></div>
                <div className="w-full flex flex-col">
                    <p className="text-left text-md dark:text-white"><span className="font-bold">Casting Time:</span> {casting_time}</p>
                    <p className="text-left text-md dark:text-white"><span className="font-bold">Range/Area:</span> {range}</p>
                    <p className="text-left text-md dark:text-white"><span className="font-bold">Components:</span> {components.join(', ')}</p>
                    <p className="text-left text-md dark:text-white"><span className="font-bold">Duration:</span> {duration}</p>
                    {
                        ritual && 
                        <p className="text-left text-md dark:text-white"><span className="font-bold">Ritual</span></p>
                    }
                    
                </div>
                <div className="my-2 border-t-2 solid border-gray-300"></div>
                <div className="w-full flex flex-col">
                    {
                        desc.map((d: string) => {
                            return(
                                <>
                                    <p className="text-left text-md dark:text-white">{d}</p>
                                    <br></br>
                                </>
                            ) 
                        })
                    }
                </div>
            </div>
        )
    }
    return null;
}